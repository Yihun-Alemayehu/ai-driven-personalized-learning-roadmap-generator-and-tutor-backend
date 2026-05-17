import 'package:flutter/material.dart';

class QuizQuestionCard extends StatelessWidget {
  const QuizQuestionCard({
    required this.prompt,
    required this.options,
    this.selected,
    this.onChanged,
    super.key,
  });

  final String prompt;
  final List<String> options;
  final String? selected;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(prompt, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            ...options.map(
              (option) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  selected == option
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                ),
                title: Text(option),
                onTap: onChanged == null ? null : () => onChanged!(option),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
