class QuizQuestion {
  const QuizQuestion({
    required this.id,
    required this.prompt,
    required this.options,
  });

  final String id;
  final String prompt;
  final List<String> options;

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      id: json['id'] as String,
      prompt: json['prompt'] as String,
      options: (json['options'] as List<dynamic>? ?? <dynamic>[])
          .map((item) => item as String)
          .toList(),
    );
  }
}

class Quiz {
  const Quiz({required this.id, required this.title, required this.questions});

  final String id;
  final String title;
  final List<QuizQuestion> questions;

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['id'] as String,
      title: json['title'] as String,
      questions: (json['questions'] as List<dynamic>? ?? <dynamic>[])
          .map((item) => QuizQuestion.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
