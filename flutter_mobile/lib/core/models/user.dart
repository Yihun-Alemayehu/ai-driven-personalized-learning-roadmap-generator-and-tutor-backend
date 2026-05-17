enum UserRole { learner, instructor, admin, domainExpert }

UserRole userRoleFromJson(String value) {
  switch (value) {
    case 'learner':
      return UserRole.learner;
    case 'instructor':
      return UserRole.instructor;
    case 'admin':
      return UserRole.admin;
    case 'domain_expert':
    case 'domainExpert':
      return UserRole.domainExpert;
    default:
      return UserRole.learner;
  }
}

class User {
  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
    this.preferredLanguage,
  });

  final String id;
  final String email;
  final String fullName;
  final UserRole role;
  final String? avatarUrl;
  final String? preferredLanguage;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: userRoleFromJson((json['role'] as String?) ?? 'learner'),
      avatarUrl: json['avatarUrl'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role == UserRole.domainExpert ? 'domain_expert' : role.name,
      'avatarUrl': avatarUrl,
      'preferredLanguage': preferredLanguage,
    };
  }
}

class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {'accessToken': accessToken, 'refreshToken': refreshToken};
  }
}
