import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_errors.dart';
import '../../core/api/enrollments_api.dart';
import '../../core/models/domain.dart';
import '../../core/models/enrollment.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/theme/app_colors.dart';
import 'domain_meta.dart';

class EnrollBottomSheet extends ConsumerStatefulWidget {
  const EnrollBottomSheet({required this.domain, super.key});

  final Domain domain;

  @override
  ConsumerState<EnrollBottomSheet> createState() => _EnrollBottomSheetState();
}

class _EnrollBottomSheetState extends ConsumerState<EnrollBottomSheet> {
  int _step = 1;
  bool _saving = false;
  String? _error;

  int _weeklyHours = 10;
  FamiliarityLevel _familiarity = FamiliarityLevel.beginner;
  LearningGoal _learningGoal = LearningGoal.getJob;
  PreferredLearningStyle? _learningStyle;
  final _priorSkillsController = TextEditingController();
  final _aboutController = TextEditingController();
  late final TextEditingController _weeklyHoursController;
  bool _defaultsLoaded = false;

  @override
  void initState() {
    super.initState();
    _weeklyHoursController = TextEditingController(text: '$_weeklyHours');
  }

  EnrollResult? _enrollResult;

  @override
  void dispose() {
    _weeklyHoursController.dispose();
    _priorSkillsController.dispose();
    _aboutController.dispose();
    super.dispose();
  }

  void _loadDefaults(SettingsState? settings) {
    if (_defaultsLoaded || settings == null) return;
    _defaultsLoaded = true;
    final d = settings.learningDefaults;
    final hours = d.weeklyHoursGoal;
    setState(() {
      _weeklyHours = hours;
      _familiarity = d.familiarityLevel;
      _learningGoal = d.learningGoal;
      if (d.aboutSelf != null && d.aboutSelf!.trim().isNotEmpty) {
        _aboutController.text = d.aboutSelf!.trim();
      }
    });
    _weeklyHoursController.text = '$hours';
  }

  Future<void> _submit() async {
    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      final result = await ref.read(enrollNotifierProvider.notifier).enroll(
            EnrollPayload(
              domainId: widget.domain.id,
              weeklyHours: _weeklyHours,
              familiarityLevel: _familiarity,
              learningGoal: _learningGoal,
              aboutSelf: _aboutController.text,
              preferredLearningStyle: _learningStyle,
              priorSkills: _priorSkillsController.text,
            ),
          );

      await ref.read(settingsProvider.notifier).setLearningDefaults(
            LearningDefaults(
              weeklyHoursGoal: _weeklyHours,
              familiarityLevel: _familiarity,
              learningGoal: _learningGoal,
              aboutSelf: _aboutController.text,
            ),
          );

      if (!mounted) return;
      setState(() {
        _enrollResult = result;
        _step = 3;
        _saving = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error = e is DioException
            ? dioErrorMessage(e, fallback: 'Enrollment failed. Please try again.')
            : 'Enrollment failed. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    _loadDefaults(ref.watch(settingsProvider).valueOrNull);
    final meta = domainMetaForSlug(widget.domain.slug);
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: _step == 2 ? 0.92 : 0.72,
        minChildSize: 0.45,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollController) {
          return DecoratedBox(
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(
                top: BorderSide(color: AppColors.border),
                left: BorderSide(color: AppColors.border),
                right: BorderSide(color: AppColors.border),
              ),
            ),
            child: Column(
              children: <Widget>[
                const SizedBox(height: 10),
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                  child: Row(
                    children: List<Widget>.generate(3, (i) {
                      final stepIndex = i + 1;
                      final active = _step >= stepIndex;
                      return Expanded(
                        child: Container(
                          height: 3,
                          margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
                          decoration: BoxDecoration(
                            color: active
                                ? AppColors.accent
                                : AppColors.border.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
                Expanded(
                  child: _step == 1
                      ? _StepIntro(
                          domain: widget.domain,
                          meta: meta,
                          onClose: () => Navigator.of(context).pop(),
                          onNext: () => setState(() => _step = 2),
                        )
                      : _step == 2
                          ? _StepForm(
                              scrollController: scrollController,
                              weeklyHoursController: _weeklyHoursController,
                              familiarity: _familiarity,
                              learningGoal: _learningGoal,
                              learningStyle: _learningStyle,
                              priorSkillsController: _priorSkillsController,
                              aboutController: _aboutController,
                              saving: _saving,
                              error: _error,
                              onWeeklyHoursChanged: (v) =>
                                  setState(() => _weeklyHours = v),
                              onFamiliarityChanged: (v) =>
                                  setState(() => _familiarity = v),
                              onGoalChanged: (v) =>
                                  setState(() => _learningGoal = v),
                              onStyleChanged: (v) =>
                                  setState(() => _learningStyle = v),
                              onBack: () => setState(() {
                                _step = 1;
                                _error = null;
                              }),
                              onSubmit: _submit,
                            )
                          : _StepSuccess(
                              result: _enrollResult!,
                              onOpenRoadmap: () => Navigator.of(context)
                                  .pop(_enrollResult!.enrollment.id),
                            ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ── Step 1 ───────────────────────────────────────────────────────────────────

class _StepIntro extends StatelessWidget {
  const _StepIntro({
    required this.domain,
    required this.meta,
    required this.onClose,
    required this.onNext,
  });

  final Domain domain;
  final DomainMeta meta;
  final VoidCallback onClose;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: meta.background,
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Text(
              meta.icon,
              style: TextStyle(
                fontSize: 22,
                color: meta.accent,
                fontFamily: 'monospace',
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Enroll in ${domain.name}',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontSize: 22,
                  color: const Color(0xFF3D342A),
                  fontWeight: FontWeight.w600,
                ),
          ),
          if (domain.description != null &&
              domain.description!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 8),
            Text(
              domain.description!.trim(),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF6E645A),
                    fontSize: 14,
                  ),
            ),
          ],
          const SizedBox(height: 16),
          Text(
            "Before we generate your roadmap, we'd like to personalise it based "
            'on your background, goals, and available time.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF6E645A),
                  fontSize: 14,
                  height: 1.45,
                ),
          ),
          const Spacer(),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton(
                  onPressed: onClose,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF6E645A),
                    side: const BorderSide(color: AppColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: onNext,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    foregroundColor: AppColors.background,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text('Personalise →'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Step 2 ───────────────────────────────────────────────────────────────────

class _StepForm extends StatelessWidget {
  const _StepForm({
    required this.scrollController,
    required this.weeklyHoursController,
    required this.familiarity,
    required this.learningGoal,
    required this.learningStyle,
    required this.priorSkillsController,
    required this.aboutController,
    required this.saving,
    required this.error,
    required this.onWeeklyHoursChanged,
    required this.onFamiliarityChanged,
    required this.onGoalChanged,
    required this.onStyleChanged,
    required this.onBack,
    required this.onSubmit,
  });

  final ScrollController scrollController;
  final TextEditingController weeklyHoursController;
  final FamiliarityLevel familiarity;
  final LearningGoal learningGoal;
  final PreferredLearningStyle? learningStyle;
  final TextEditingController priorSkillsController;
  final TextEditingController aboutController;
  final bool saving;
  final String? error;
  final ValueChanged<int> onWeeklyHoursChanged;
  final ValueChanged<FamiliarityLevel> onFamiliarityChanged;
  final ValueChanged<LearningGoal> onGoalChanged;
  final ValueChanged<PreferredLearningStyle?> onStyleChanged;
  final VoidCallback onBack;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'Tell us about yourself',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontSize: 20,
                      color: const Color(0xFF3D342A),
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                'This helps us tailor the roadmap to your needs.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF6E645A),
                      fontSize: 14,
                    ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
            children: <Widget>[
              const _FieldLabel('Your experience level'),
              const SizedBox(height: 8),
              ..._familiarityOptions.map(
                (opt) => _RadioOption<FamiliarityLevel>(
                  value: opt.value,
                  groupValue: familiarity,
                  title: opt.label,
                  subtitle: opt.desc,
                  accent: AppColors.accent,
                  onChanged: saving ? null : onFamiliarityChanged,
                ),
              ),
              const SizedBox(height: 20),
              const _FieldLabel('Your goal'),
              const SizedBox(height: 8),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 2.6,
                children: _goalOptions.map((opt) {
                  return _ChipOption<LearningGoal>(
                    label: opt.label,
                    icon: opt.icon,
                    value: opt.value,
                    selected: learningGoal == opt.value,
                    accent: const Color(0xFF4A6FA5),
                    onTap: saving ? null : () => onGoalChanged(opt.value),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              const _FieldLabel('Hours per week you can commit'),
              const SizedBox(height: 8),
              TextField(
                keyboardType: TextInputType.number,
                enabled: !saving,
                decoration: _inputDecoration(hint: 'e.g. 10'),
                controller: weeklyHoursController,
                onChanged: (v) {
                  final parsed = int.tryParse(v);
                  if (parsed != null && parsed >= 1 && parsed <= 80) {
                    onWeeklyHoursChanged(parsed);
                  }
                },
              ),
              const SizedBox(height: 20),
              const _FieldLabel('Preferred learning style'),
              const SizedBox(height: 8),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 2.6,
                children: _styleOptions.map((opt) {
                  return _ChipOption<PreferredLearningStyle>(
                    label: opt.label,
                    icon: opt.icon,
                    value: opt.value,
                    selected: learningStyle == opt.value,
                    accent: const Color(0xFF3D8B5E),
                    onTap: saving
                        ? null
                        : () => onStyleChanged(
                              learningStyle == opt.value ? null : opt.value,
                            ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              const _FieldLabel('Skills you already know', optional: true),
              const SizedBox(height: 8),
              TextField(
                controller: priorSkillsController,
                enabled: !saving,
                maxLines: 2,
                decoration: _inputDecoration(
                  hint: 'e.g. HTML, CSS, basic JavaScript, Git…',
                ),
              ),
              const SizedBox(height: 16),
              const _FieldLabel('Tell us about yourself', optional: true),
              const SizedBox(height: 8),
              TextField(
                controller: aboutController,
                enabled: !saving,
                maxLines: 3,
                decoration: _inputDecoration(
                  hint:
                      "e.g. I'm a self-taught developer looking to transition…",
                ),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
          decoration: BoxDecoration(
            color: AppColors.background,
            border: Border(
              top: BorderSide(color: AppColors.border.withValues(alpha: 0.8)),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              if (error != null) ...<Widget>[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    error!,
                    style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 13),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              Row(
                children: <Widget>[
                  OutlinedButton.icon(
                    onPressed: saving ? null : onBack,
                    icon: const Icon(Icons.chevron_left, size: 18),
                    label: const Text('Back'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF6E645A),
                      side: const BorderSide(color: AppColors.border),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: saving ? null : onSubmit,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.accent,
                        foregroundColor: AppColors.background,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: saving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              saving
                                  ? 'Generating roadmap…'
                                  : 'Start learning →',
                            ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Step 3 ───────────────────────────────────────────────────────────────────

class _StepSuccess extends StatelessWidget {
  const _StepSuccess({
    required this.result,
    required this.onOpenRoadmap,
  });

  final EnrollResult result;
  final VoidCallback onOpenRoadmap;

  @override
  Widget build(BuildContext context) {
    final p = result.personalization;

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF86EFAC)),
            ),
            child: const Icon(
              Icons.check_circle_outline,
              color: Color(0xFF16A34A),
              size: 26,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Roadmap ready!',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontSize: 22,
                  color: const Color(0xFF3D342A),
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Your personalized learning path has been created.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF6E645A),
                  fontSize: 14,
                ),
          ),
          const SizedBox(height: 20),
          Row(
            children: <Widget>[
              Expanded(
                child: _StatBox(
                  value: '${result.totalNodes}',
                  label: 'Total nodes',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _StatBox(
                  value: '${result.unlockedNodes}',
                  label: 'Unlocked',
                ),
              ),
            ],
          ),
          if (p.hasSummary) ...<Widget>[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8EB),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: const Color(0xFFE8D4A8).withValues(alpha: 0.8),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'PERSONALIZED FOR YOU',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          letterSpacing: 1.2,
                          color: AppColors.textMuted,
                          fontSize: 10,
                        ),
                  ),
                  const SizedBox(height: 10),
                  if (p.skippedNodes > 0)
                    _SummaryRow(
                      icon: Icons.fast_forward,
                      text:
                          'Skipped ${p.skippedNodes} node${p.skippedNodes == 1 ? '' : 's'} you already know',
                    ),
                  if (p.supplementaryNodes > 0)
                    _SummaryRow(
                      icon: Icons.add,
                      text:
                          'Added ${p.supplementaryNodes} supplementary node${p.supplementaryNodes == 1 ? '' : 's'}',
                    ),
                  if (p.unlockAcceleration != null &&
                      p.unlockAcceleration!.isNotEmpty)
                    _SummaryRow(
                      icon: Icons.bolt,
                      text: p.unlockAcceleration == 'advanced'
                          ? 'Advanced unlock — easy nodes pre-mastered'
                          : 'Intermediate unlock — foundational nodes opened',
                    ),
                ],
              ),
            ),
          ],
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onOpenRoadmap,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: AppColors.background,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text('Open roadmap →'),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Shared widgets ───────────────────────────────────────────────────────────

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text, {this.optional = false});

  final String text;
  final bool optional;

  @override
  Widget build(BuildContext context) {
    return Text(
      optional ? '$text (optional)' : text.toUpperCase(),
      style: Theme.of(context).textTheme.labelSmall?.copyWith(
            letterSpacing: optional ? 0 : 1,
            color: AppColors.textMuted,
            fontSize: optional ? 13 : 10,
            fontWeight: optional ? FontWeight.normal : FontWeight.w600,
          ),
    );
  }
}

class _RadioOption<T> extends StatelessWidget {
  const _RadioOption({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.subtitle,
    required this.accent,
    required this.onChanged,
  });

  final T value;
  final T groupValue;
  final String title;
  final String subtitle;
  final Color accent;
  final ValueChanged<T>? onChanged;

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: selected
            ? accent.withValues(alpha: 0.08)
            : AppColors.background,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onChanged == null ? null : () => onChanged!(value),
          borderRadius: BorderRadius.circular(8),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: selected ? accent : AppColors.border,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: <Widget>[
                  Icon(
                    selected
                        ? Icons.radio_button_checked
                        : Icons.radio_button_off,
                    size: 18,
                    color: selected ? accent : AppColors.border,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1A1614),
                          ),
                        ),
                        Text(
                          subtitle,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF9A9088),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ChipOption<T> extends StatelessWidget {
  const _ChipOption({
    required this.label,
    required this.icon,
    required this.value,
    required this.selected,
    required this.accent,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final T value;
  final bool selected;
  final Color accent;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? accent.withValues(alpha: 0.1) : AppColors.background,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: selected ? accent : AppColors.border),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: Row(
              children: <Widget>[
                Icon(
                  icon,
                  size: 14,
                  color: selected ? accent : AppColors.textMuted,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 13,
                      color: selected
                          ? const Color(0xFF1A1614)
                          : AppColors.textBody,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontSize: 22,
                  color: const Color(0xFF1A1614),
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 2),
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 0.8,
                  color: AppColors.textMuted,
                  fontSize: 10,
                ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(icon, size: 14, color: AppColors.textMuted),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: Color(0xFF3A342E)),
            ),
          ),
        ],
      ),
    );
  }
}

InputDecoration _inputDecoration({required String hint}) {
  return InputDecoration(
    hintText: hint,
    hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.85)),
    filled: true,
    fillColor: AppColors.background,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: AppColors.accent.withValues(alpha: 0.85)),
    ),
  );
}

// ── Option data ──────────────────────────────────────────────────────────────

class _FamiliarityOpt {
  const _FamiliarityOpt(this.value, this.label, this.desc);
  final FamiliarityLevel value;
  final String label;
  final String desc;
}

const _familiarityOptions = <_FamiliarityOpt>[
  _FamiliarityOpt(
    FamiliarityLevel.beginner,
    'Beginner',
    'Little to no prior experience',
  ),
  _FamiliarityOpt(
    FamiliarityLevel.intermediate,
    'Intermediate',
    'Some experience, looking to advance',
  ),
  _FamiliarityOpt(
    FamiliarityLevel.advanced,
    'Advanced',
    'Solid foundation, filling gaps',
  ),
];

class _GoalOpt {
  const _GoalOpt(this.value, this.label, this.icon);
  final LearningGoal value;
  final String label;
  final IconData icon;
}

const _goalOptions = <_GoalOpt>[
  _GoalOpt(LearningGoal.getJob, 'Get a job', Icons.work_outline),
  _GoalOpt(LearningGoal.upskill, 'Upskill at work', Icons.trending_up),
  _GoalOpt(LearningGoal.hobby, 'Personal interest', Icons.favorite_border),
  _GoalOpt(LearningGoal.certification, 'Get certified', Icons.emoji_events_outlined),
];

class _StyleOpt {
  const _StyleOpt(this.value, this.label, this.icon);
  final PreferredLearningStyle value;
  final String label;
  final IconData icon;
}

const _styleOptions = <_StyleOpt>[
  _StyleOpt(PreferredLearningStyle.visual, 'Visual', Icons.visibility_outlined),
  _StyleOpt(PreferredLearningStyle.reading, 'Reading', Icons.menu_book_outlined),
  _StyleOpt(PreferredLearningStyle.handsOn, 'Hands-on', Icons.build_outlined),
  _StyleOpt(PreferredLearningStyle.video, 'Video', Icons.play_circle_outline),
];
