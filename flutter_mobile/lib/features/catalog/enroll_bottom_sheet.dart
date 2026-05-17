import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/enrollments_api.dart';
import '../../core/models/domain.dart';
import '../../core/models/enrollment.dart';
import '../../core/providers/enrollments_provider.dart';
import '../../core/providers/settings_provider.dart';

class EnrollBottomSheet extends ConsumerStatefulWidget {
  const EnrollBottomSheet({required this.domain, super.key});

  final Domain domain;

  @override
  ConsumerState<EnrollBottomSheet> createState() => _EnrollBottomSheetState();
}

class _EnrollBottomSheetState extends ConsumerState<EnrollBottomSheet> {
  final _aboutController = TextEditingController();

  int _weeklyHours = 8;
  FamiliarityLevel _familiarity = FamiliarityLevel.beginner;
  LearningGoal _learningGoal = LearningGoal.getJob;
  bool _saving = false;
  bool _hasPrefilled = false;

  @override
  void dispose() {
    _aboutController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider).valueOrNull;
    if (!_hasPrefilled && settings != null) {
      _hasPrefilled = true;
      _weeklyHours = settings.learningDefaults.weeklyHours ?? _weeklyHours;
      _familiarity = settings.learningDefaults.familiarityLevel ?? _familiarity;
      _learningGoal = settings.learningDefaults.learningGoal ?? _learningGoal;
      _aboutController.text = settings.learningDefaults.aboutSelf ?? '';
    }

    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) {
        return DecoratedBox(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: controller,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
            children: <Widget>[
              Text(
                'Enroll in ${widget.domain.name}',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 6),
              Text(
                'Set your preferences to generate a better adaptive roadmap.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 18),
              Text('Weekly hours: $_weeklyHours',
                  style: Theme.of(context).textTheme.titleMedium),
              Slider(
                min: 1,
                max: 40,
                divisions: 39,
                value: _weeklyHours.toDouble(),
                label: '$_weeklyHours',
                onChanged: _saving
                    ? null
                    : (value) {
                        setState(() {
                          _weeklyHours = value.round();
                        });
                      },
              ),
              const SizedBox(height: 8),
              Text('Familiarity',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              SegmentedButton<FamiliarityLevel>(
                segments: const <ButtonSegment<FamiliarityLevel>>[
                  ButtonSegment(
                    value: FamiliarityLevel.beginner,
                    label: Text('Beginner'),
                  ),
                  ButtonSegment(
                    value: FamiliarityLevel.intermediate,
                    label: Text('Intermediate'),
                  ),
                  ButtonSegment(
                    value: FamiliarityLevel.advanced,
                    label: Text('Advanced'),
                  ),
                ],
                selected: <FamiliarityLevel>{_familiarity},
                onSelectionChanged: _saving
                    ? null
                    : (selection) {
                        setState(() {
                          _familiarity = selection.first;
                        });
                      },
              ),
              const SizedBox(height: 14),
              Text('Learning goal',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: LearningGoal.values.map((goal) {
                  return ChoiceChip(
                    label: Text(_goalLabel(goal)),
                    selected: _learningGoal == goal,
                    onSelected: _saving
                        ? null
                        : (_) {
                            setState(() {
                              _learningGoal = goal;
                            });
                          },
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _aboutController,
                maxLength: 200,
                maxLines: 4,
                enabled: !_saving,
                decoration: const InputDecoration(
                  labelText: 'About yourself (optional)',
                  hintText: 'Share prior experience or learning context',
                ),
              ),
              const SizedBox(height: 10),
              FilledButton(
                onPressed: _saving
                    ? null
                    : () async {
                        setState(() {
                          _saving = true;
                        });

                        try {
                          final enrollment = await ref
                              .read(enrollNotifierProvider.notifier)
                              .enroll(
                                EnrollPayload(
                                  domainId: widget.domain.id,
                                  weeklyHours: _weeklyHours,
                                  familiarityLevel: _familiarity,
                                  learningGoal: _learningGoal,
                                  aboutSelf: _aboutController.text,
                                ),
                              );

                          await ref
                              .read(settingsProvider.notifier)
                              .setLearningDefaults(
                                LearningDefaults(
                                  weeklyHours: _weeklyHours,
                                  familiarityLevel: _familiarity,
                                  learningGoal: _learningGoal,
                                  aboutSelf: _aboutController.text,
                                ),
                              );

                          if (!context.mounted) {
                            return;
                          }

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Enrolled in ${widget.domain.name} successfully.',
                              ),
                            ),
                          );

                          Navigator.of(context).pop(enrollment.id);
                        } catch (error) {
                          final message = _extractErrorMessage(error);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(message)),
                            );
                          }
                        } finally {
                          if (mounted) {
                            setState(() {
                              _saving = false;
                            });
                          }
                        }
                      },
                child: _saving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Enroll'),
              ),
            ],
          ),
        );
      },
    );
  }

  String _goalLabel(LearningGoal value) {
    switch (value) {
      case LearningGoal.getJob:
        return 'Get a job';
      case LearningGoal.upskill:
        return 'Upskill';
      case LearningGoal.hobby:
        return 'Hobby';
      case LearningGoal.certification:
        return 'Certification';
    }
  }

  String _extractErrorMessage(Object error) {
    if (error is DioException) {
      final payload = error.response?.data;
      if (payload is Map<String, dynamic>) {
        final nested = payload['error'];
        if (nested is Map<String, dynamic>) {
          final message = nested['message'];
          if (message is String && message.trim().isNotEmpty) {
            return message;
          }
        }
      }
    }

    return 'Unable to create enrollment. Please try again.';
  }
}
