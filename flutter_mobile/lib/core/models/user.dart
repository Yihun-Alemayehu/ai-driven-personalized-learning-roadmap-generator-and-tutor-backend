import 'package:flutter/foundation.dart';

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
    this.createdAt,
  });

  final String id;
  final String email;
  final String fullName;
  final UserRole role;
  final String? avatarUrl;
  final String? preferredLanguage;
  final DateTime? createdAt;

  factory User.fromJson(Map<String, dynamic> json) {
    debugPrint('[USER] Parsing User from JSON: $json');
    try {
      final userPayload = json['user'] as Map<String, dynamic>? ?? json;
      final user = User(
        id: userPayload['id'] as String,
        email: userPayload['email'] as String,
        fullName: (userPayload['fullName'] as String?) ?? 'Unknown',
        role: userRoleFromJson((userPayload['role'] as String?) ?? 'learner'),
        avatarUrl: userPayload['avatarUrl'] as String?,
        preferredLanguage: userPayload['preferredLanguage'] as String?,
        createdAt: userPayload['createdAt'] == null
            ? null
            : DateTime.tryParse(userPayload['createdAt'] as String),
      );
      debugPrint('[USER] User parsed successfully: ${user.id}');
      return user;
    } catch (e) {
      debugPrint('[USER] ERROR parsing User: $e');
      debugPrint('[USER] JSON received: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role == UserRole.domainExpert ? 'domain_expert' : role.name,
      'avatarUrl': avatarUrl,
      'preferredLanguage': preferredLanguage,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }
}

class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    debugPrint('[AUTH_TOKENS] Parsing tokens from JSON: accessToken=${json['accessToken'] != null ? 'present' : 'MISSING'}, refreshToken=${json['refreshToken'] != null ? 'present' : 'MISSING'}');
    try {
      final tokens = AuthTokens(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
      );
      debugPrint('[AUTH_TOKENS] Tokens parsed successfully');
      return tokens;
    } catch (e) {
      debugPrint('[AUTH_TOKENS] ERROR parsing tokens: $e');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {'accessToken': accessToken, 'refreshToken': refreshToken};
  }
}
