import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/api/api_client.dart';
import '../../core/api/instructor_chat_api.dart';
import '../../core/models/explanation.dart';
import '../../core/models/roadmap_node.dart';
import '../../core/theme/app_colors.dart';

final instructorChatApiProvider = Provider<InstructorChatApi>(
  (ref) => InstructorChatApi(ref.watch(apiClientProvider).dio),
);

/// Warm accent-tinted palette for the instructor panel (matches web).
abstract final class _InstructorPalette {
  static const Color headerBackground = Color(0xFFF5EDE6);
  static const Color avatarFill = Color(0xFFE8D4C8);
  static const Color avatarIcon = Color(0xFF8F4A2E);
  static const Color chipFill = Color(0xFFF0E4DC);
  static const Color chipBorder = Color(0xFFD9C4B8);
  static const Color chipText = Color(0xFF8F4A2E);
  static const Color botBubbleFill = Color(0xFFFFFFFF);
  static const Color botBubbleBorder = Color(0xFFE5D9CE);
  static const Color suggestionBorder = Color(0xFFE0D4C8);
  static const Color suggestionHeader = Color(0xFFF0E8E0);
  static const Color suggestionRowA = Color(0xFFFEFCF9);
  static const Color suggestionRowB = Color(0xFFFAF7F1);
  static const Color suggestionArrow = Color(0xFFA06848);
  static const Color inputFill = Color(0xFFF3EFE7);
  static const Color hintText = Color(0xFFB8B0A8);
  static const Color sendDisabled = Color(0xFFC2B9A6);
}

class AiInstructorDrawer extends ConsumerStatefulWidget {
  const AiInstructorDrawer({
    required this.node,
    required this.enrollmentId,
    this.explanation,
    super.key,
  });

  final RoadmapNode node;
  final String enrollmentId;
  final Explanation? explanation;

  @override
  ConsumerState<AiInstructorDrawer> createState() => _AiInstructorDrawerState();
}

class _AiInstructorDrawerState extends ConsumerState<AiInstructorDrawer> {
  final List<_ChatMessage> _messages = <_ChatMessage>[];
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _inputFocus = FocusNode();
  bool _isSending = false;
  bool _inputFocused = false;

  @override
  void initState() {
    super.initState();
    _resetConversation();
    _inputFocus.addListener(() {
      setState(() => _inputFocused = _inputFocus.hasFocus);
    });
  }

  @override
  void didUpdateWidget(covariant AiInstructorDrawer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.node.id != widget.node.id) {
      _resetConversation();
    }
  }

  void _resetConversation() {
    _messages
      ..clear()
      ..add(
        _ChatMessage(
          isUser: false,
          text:
              "Hi! I'm your AI instructor for this lesson. Ask me anything about ${widget.node.title}.",
        ),
      );
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _inputFocus.dispose();
    super.dispose();
  }

  List<String> _suggestedPrompts() {
    final title = widget.node.title;
    final exp = widget.explanation;
    if (exp != null && exp.keyPoints.length >= 2) {
      return <String>[
        'Can you elaborate on: "${exp.keyPoints.first}"?',
        'What\'s the most common mistake beginners make with $title?',
        'How does $title apply in real-world projects?',
        'What should I practice first when learning $title?',
      ];
    }
    return <String>[
      'What is $title and why does it matter?',
      'What are the core concepts in $title?',
      'What\'s the best way to practice $title?',
      'What prerequisites do I need for $title?',
    ];
  }

  bool get _hasExplanationContext {
    final exp = widget.explanation;
    return exp != null &&
        (exp.summary.isNotEmpty || exp.keyPoints.isNotEmpty);
  }

  Future<void> _send(String question) async {
    final q = question.trim();
    if (q.isEmpty || _isSending) {
      return;
    }

    setState(() {
      _isSending = true;
      _messages.add(_ChatMessage(isUser: true, text: q));
      _inputController.clear();
    });
    _scrollToBottom();

    try {
      final api = ref.read(instructorChatApiProvider);
      final answer = await api.ask(
        nodeId: widget.node.id,
        question: q,
        enrollmentId: widget.enrollmentId,
        explanation: widget.explanation,
      );

      if (!mounted) {
        return;
      }

      setState(() {
        _messages.add(
          _ChatMessage(
            isUser: false,
            text: answer?.trim().isNotEmpty == true
                ? answer!
                : 'I wasn\'t able to generate an answer. Please try again.',
          ),
        );
        _isSending = false;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _messages.add(
          const _ChatMessage(
            isUser: false,
            text: 'Something went wrong. Please try again.',
          ),
        );
        _isSending = false;
      });
    }
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  TextStyle get _monoLabel => GoogleFonts.jetBrainsMono(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        letterSpacing: 1.2,
        color: _InstructorPalette.suggestionArrow,
      );

  @override
  Widget build(BuildContext context) {
    final showSuggestions = _messages.length == 1 && !_isSending;
    final suggestions = _suggestedPrompts();
    final canSend =
        _inputController.text.trim().isNotEmpty && !_isSending;

    return ColoredBox(
      color: AppColors.background,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            _InstructorHeader(
              nodeTitle: widget.node.title,
              hasContext: _hasExplanationContext,
              onClose: () => Navigator.of(context).pop(),
            ),
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                itemCount: _messages.length + (_isSending ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index >= _messages.length) {
                    return const _TypingRow();
                  }
                  return _ChatBubble(message: _messages[index]);
                },
              ),
            ),
            if (showSuggestions)
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
                child: _SuggestedQuestionsCard(
                  prompts: suggestions,
                  labelStyle: _monoLabel,
                  onSelect: _send,
                ),
              ),
            _InstructorInputBar(
              controller: _inputController,
              focusNode: _inputFocus,
              isFocused: _inputFocused,
              isSending: _isSending,
              canSend: canSend,
              onSend: () => _send(_inputController.text),
              onChanged: (_) => setState(() {}),
            ),
          ],
        ),
      ),
    );
  }
}

class _InstructorHeader extends StatelessWidget {
  const _InstructorHeader({
    required this.nodeTitle,
    required this.hasContext,
    required this.onClose,
  });

  final String nodeTitle;
  final bool hasContext;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: _InstructorPalette.headerBackground,
        border: Border(
          bottom: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 8, 10),
            child: Row(
              children: <Widget>[
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _InstructorPalette.avatarFill,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _InstructorPalette.chipFill,
                      width: 3,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(
                    Icons.smart_toy_outlined,
                    size: 18,
                    color: _InstructorPalette.avatarIcon,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'AI Instructor',
                        style: GoogleFonts.crimsonText(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          height: 1.1,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        nodeTitle,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 11,
                          height: 1.25,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                _HeaderIconButton(
                  icon: Icons.close,
                  onPressed: onClose,
                ),
              ],
            ),
          ),
          if (hasContext)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: _InstructorPalette.chipFill,
                    borderRadius: BorderRadius.circular(99),
                    border: Border.all(color: _InstructorPalette.chipBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        '✦',
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 10,
                          color: _InstructorPalette.chipText,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Explanation loaded as context',
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 10,
                          color: _InstructorPalette.chipText,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  const _HeaderIconButton({required this.icon, required this.onPressed});

  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          width: 36,
          height: 36,
          child: Icon(icon, size: 20, color: AppColors.textMuted),
        ),
      ),
    );
  }
}

class _SuggestedQuestionsCard extends StatelessWidget {
  const _SuggestedQuestionsCard({
    required this.prompts,
    required this.labelStyle,
    required this.onSelect,
  });

  final List<String> prompts;
  final TextStyle labelStyle;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _InstructorPalette.suggestionBorder),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(9),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: _InstructorPalette.suggestionHeader,
                border: Border(
                  bottom: BorderSide(color: _InstructorPalette.suggestionBorder),
                ),
              ),
              child: Text(
                'SUGGESTED QUESTIONS',
                style: labelStyle,
              ),
            ),
            for (var i = 0; i < prompts.length; i++)
              Material(
                color: i.isEven
                    ? _InstructorPalette.suggestionRowA
                    : _InstructorPalette.suggestionRowB,
                child: InkWell(
                  onTap: () => onSelect(prompts[i]),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 11,
                    ),
                    decoration: BoxDecoration(
                      border: i > 0
                          ? const Border(
                              top: BorderSide(
                                color: Color(0xFFEBE3DA),
                                width: 1,
                              ),
                            )
                          : null,
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            '→',
                            style: GoogleFonts.jetBrainsMono(
                              fontSize: 11,
                              color: _InstructorPalette.suggestionArrow,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            prompts[i],
                            style: GoogleFonts.crimsonText(
                              fontSize: 13.5,
                              height: 1.4,
                              color: AppColors.textBody,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _InstructorInputBar extends StatelessWidget {
  const _InstructorInputBar({
    required this.controller,
    required this.focusNode,
    required this.isFocused,
    required this.isSending,
    required this.canSend,
    required this.onSend,
    required this.onChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isFocused;
  final bool isSending;
  final bool canSend;
  final VoidCallback onSend;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: const BoxDecoration(
        color: AppColors.background,
        border: Border(
          top: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      child: Column(
        children: <Widget>[
          AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            constraints: const BoxConstraints(minHeight: 48),
            padding: const EdgeInsets.fromLTRB(6, 4, 4, 4),
            decoration: BoxDecoration(
              color: _InstructorPalette.inputFill,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isFocused ? AppColors.accent : AppColors.border,
                width: 1,
              ),
              boxShadow: isFocused
                  ? <BoxShadow>[
                      BoxShadow(
                        color: AppColors.accent.withValues(alpha: 0.18),
                        blurRadius: 0,
                        spreadRadius: 3,
                      ),
                    ]
                  : null,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Expanded(
                  child: GestureDetector(
                    onTap: () => focusNode.requestFocus(),
                    behavior: HitTestBehavior.opaque,
                    child: TextField(
                      controller: controller,
                      focusNode: focusNode,
                      minLines: 1,
                      maxLines: 4,
                      enabled: !isSending,
                      textAlignVertical: TextAlignVertical.center,
                      style: GoogleFonts.crimsonText(
                        fontSize: 14,
                        height: 1.4,
                        color: AppColors.textPrimary,
                      ),
                      decoration: InputDecoration(
                        isDense: false,
                        filled: true,
                        fillColor: Colors.transparent,
                        contentPadding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 8,
                        ),
                        constraints: const BoxConstraints(
                          minHeight: 40,
                        ),
                        hintText: 'Ask anything about this lesson…',
                        hintStyle: GoogleFonts.crimsonText(
                          fontSize: 14,
                          height: 1.4,
                          color: _InstructorPalette.hintText,
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                      ),
                      onChanged: onChanged,
                      onSubmitted: (_) => onSend(),
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                Material(
                  color: canSend
                      ? AppColors.textPrimary
                      : _InstructorPalette.sendDisabled,
                  shape: const CircleBorder(),
                  child: InkWell(
                    onTap: canSend ? onSend : null,
                    customBorder: const CircleBorder(),
                    child: const SizedBox(
                      width: 32,
                      height: 32,
                      child: Icon(
                        Icons.arrow_upward_rounded,
                        size: 18,
                        color: AppColors.background,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tap send to ask · multi-line supported',
            textAlign: TextAlign.center,
            style: GoogleFonts.jetBrainsMono(
              fontSize: 9.5,
              color: const Color(0xFFC0B8B0),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  const _ChatMessage({required this.isUser, required this.text});

  final bool isUser;
  final String text;
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final _ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          if (!isUser) ...<Widget>[
            Container(
              width: 26,
              height: 26,
              margin: const EdgeInsets.only(bottom: 2),
              decoration: const BoxDecoration(
                color: _InstructorPalette.avatarFill,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.smart_toy_outlined,
                size: 13,
                color: _InstructorPalette.avatarIcon,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 280),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              decoration: BoxDecoration(
                color: isUser
                    ? AppColors.textPrimary
                    : _InstructorPalette.botBubbleFill,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(14),
                  topRight: const Radius.circular(14),
                  bottomLeft: Radius.circular(isUser ? 14 : 3),
                  bottomRight: Radius.circular(isUser ? 3 : 14),
                ),
                border: isUser
                    ? null
                    : Border.all(color: _InstructorPalette.botBubbleBorder),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color: Colors.black.withValues(
                      alpha: isUser ? 0.14 : 0.05,
                    ),
                    blurRadius: isUser ? 3 : 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Text(
                message.text,
                style: GoogleFonts.crimsonText(
                  fontSize: 13.5,
                  height: 1.45,
                  color: isUser ? const Color(0xFFF5F0EA) : AppColors.textBody,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TypingRow extends StatelessWidget {
  const _TypingRow();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: <Widget>[
          Container(
            width: 26,
            height: 26,
            decoration: const BoxDecoration(
              color: _InstructorPalette.avatarFill,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.smart_toy_outlined,
              size: 13,
              color: _InstructorPalette.avatarIcon,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: _InstructorPalette.botBubbleFill,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(14),
                bottomRight: Radius.circular(14),
                bottomLeft: Radius.circular(3),
              ),
              border: Border.all(color: _InstructorPalette.botBubbleBorder),
            ),
            child: const _TypingDots(),
          ),
        ],
      ),
    );
  }
}

class _TypingDots extends StatefulWidget {
  const _TypingDots();

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List<Widget>.generate(3, (i) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final t = (_controller.value + i * 0.2) % 1.0;
            final dy = -4 * (t < 0.5 ? t * 2 : (1 - t) * 2);
            return Transform.translate(
              offset: Offset(0, dy),
              child: child,
            );
          },
          child: Container(
            width: 5,
            height: 5,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: const BoxDecoration(
              color: _InstructorPalette.suggestionArrow,
              shape: BoxShape.circle,
            ),
          ),
        );
      }),
    );
  }
}
