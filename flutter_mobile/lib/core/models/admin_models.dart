/// Admin user for user management
class AdminUser {
  final String id;
  final String fullName;
  final String email;
  final String role;

  const AdminUser({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: (json['id'] as String?) ?? '',
      fullName: (json['fullName'] as String?) ?? '',
      email: (json['email'] as String?) ?? '',
      role: (json['role'] as String?) ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'role': role,
    };
  }
}

/// System-wide statistics
class SystemStats {
  final int totalUsers;
  final int totalEnrollments;
  final int totalQuizAttempts;
  final double avgQuizScore;

  const SystemStats({
    required this.totalUsers,
    required this.totalEnrollments,
    required this.totalQuizAttempts,
    required this.avgQuizScore,
  });

  factory SystemStats.fromJson(Map<String, dynamic> json) {
    return SystemStats(
      totalUsers: (json['totalUsers'] as num?)?.toInt() ?? 0,
      totalEnrollments: (json['totalEnrollments'] as num?)?.toInt() ?? 0,
      totalQuizAttempts: (json['totalQuizAttempts'] as num?)?.toInt() ?? 0,
      avgQuizScore: ((json['avgQuizScore'] as num?) ?? 0).toDouble(),
    );
  }
}

/// Mastery breakdown by state
class MasteryBreakdown {
  final int unknownCount;
  final int noviceCount;
  final int familiarCount;
  final int proficientCount;
  final int masteredCount;

  const MasteryBreakdown({
    required this.unknownCount,
    required this.noviceCount,
    required this.familiarCount,
    required this.proficientCount,
    required this.masteredCount,
  });

  int get total => unknownCount + noviceCount + familiarCount + proficientCount + masteredCount;

  factory MasteryBreakdown.fromJson(Map<String, dynamic> json) {
    return MasteryBreakdown(
      unknownCount: (json['unknownCount'] as num?)?.toInt() ?? 0,
      noviceCount: (json['noviceCount'] as num?)?.toInt() ?? 0,
      familiarCount: (json['familiarCount'] as num?)?.toInt() ?? 0,
      proficientCount: (json['proficientCount'] as num?)?.toInt() ?? 0,
      masteredCount: (json['masteredCount'] as num?)?.toInt() ?? 0,
    );
  }
}

/// Per-domain statistics
class DomainStat {
  final String domainId;
  final String domainName;
  final int enrollmentCount;
  final double? avgCompletion;
  final double? avgQuizScore;

  const DomainStat({
    required this.domainId,
    required this.domainName,
    required this.enrollmentCount,
    this.avgCompletion,
    this.avgQuizScore,
  });

  factory DomainStat.fromJson(Map<String, dynamic> json) {
    return DomainStat(
      domainId: (json['domainId'] as String?) ?? '',
      domainName: (json['domainName'] as String?) ?? '',
      enrollmentCount: (json['enrollmentCount'] as num?)?.toInt() ?? 0,
      avgCompletion: (json['avgCompletion'] as num?)?.toDouble(),
      avgQuizScore: (json['avgQuizScore'] as num?)?.toDouble(),
    );
  }
}

/// Domain for admin management
class AdminDomain {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final DateTime? createdAt;

  const AdminDomain({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.createdAt,
  });

  factory AdminDomain.fromJson(Map<String, dynamic> json) {
    return AdminDomain(
      id: (json['id'] as String?) ?? '',
      name: (json['name'] as String?) ?? '',
      slug: (json['slug'] as String?) ?? '',
      description: json['description'] as String?,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}
