import '../theme/mastery_config.dart';

class RoadmapNode {
  const RoadmapNode({
    required this.id,
    required this.title,
    required this.slug,
    required this.masteryState,
    required this.unlocked,
    this.description,
    this.estimatedHours,
    this.difficultyLevel,
    this.isBranchingPoint = false,
    this.isConvergencePoint = false,
    this.branchPath,
    this.positionX,
    this.positionY,
    this.bestQuizScore,
    this.attemptsCount = 0,
    this.learningOutcomes = const <String>[],
  });

  final String id;
  final String title;
  final String slug;
  final MasteryState masteryState;
  final bool unlocked;
  final String? description;
  final int? estimatedHours;
  final int? difficultyLevel;
  final bool isBranchingPoint;
  final bool isConvergencePoint;
  final String? branchPath;
  final double? positionX;
  final double? positionY;
  final double? bestQuizScore;
  final int attemptsCount;
  final List<String> learningOutcomes;

  factory RoadmapNode.fromJson(Map<String, dynamic> json) {
    final estimatedHoursRaw = json['estimatedHours'];
    final estimatedHours = estimatedHoursRaw is num
        ? estimatedHoursRaw.toInt()
        : int.tryParse('${estimatedHoursRaw ?? ''}');

    final difficultyRaw = json['difficultyLevel'];
    final difficulty = difficultyRaw is num
        ? difficultyRaw.toInt()
        : int.tryParse('${difficultyRaw ?? ''}');

    final bestScoreRaw = json['bestQuizScore'];
    final bestScore = bestScoreRaw is num
        ? bestScoreRaw.toDouble()
        : double.tryParse('${bestScoreRaw ?? ''}');

    return RoadmapNode(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: (json['slug'] as String?) ?? '',
      masteryState: MasteryConfig.stateFromApi(json['masteryState'] as String?),
      unlocked: (json['unlocked'] as bool?) ?? false,
      description: json['description'] as String?,
      estimatedHours: estimatedHours,
      difficultyLevel: difficulty,
      isBranchingPoint: (json['isBranchingPoint'] as bool?) ?? false,
      isConvergencePoint: (json['isConvergencePoint'] as bool?) ?? false,
      branchPath: json['branchPath'] as String?,
      positionX: (json['positionX'] as num?)?.toDouble(),
      positionY: (json['positionY'] as num?)?.toDouble(),
      bestQuizScore: bestScore,
      attemptsCount: (json['attemptsCount'] as num?)?.toInt() ?? 0,
      learningOutcomes:
          (json['learningOutcomes'] as List<dynamic>? ?? <dynamic>[])
              .map((item) => item as String)
              .toList(),
    );
  }
}
