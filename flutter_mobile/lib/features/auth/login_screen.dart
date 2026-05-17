import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider).valueOrNull;
    final isLoading = authState?.isLoading ?? false;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(22),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        Text(
                          'Atlas Learning',
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Sign in to continue your learning roadmap.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(labelText: 'Email'),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Email is required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password is required';
                            }
                            return null;
                          },
                        ),
                        if (authState?.error != null) ...<Widget>[
                          const SizedBox(height: 10),
                          Text(
                            authState!.error!,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: AppColors.accent),
                          ),
                        ],
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: isLoading
                              ? null
                              : () async {
                                  if (!_formKey.currentState!.validate()) {
                                    return;
                                  }

                                  await ref.read(authProvider.notifier).login(
                                        _emailController.text.trim(),
                                        _passwordController.text,
                                      );

                                  if (!context.mounted) {
                                    return;
                                  }

                                  final current =
                                      ref.read(authProvider).valueOrNull;
                                  if (current?.isAuthenticated ?? false) {
                                    context.go('/dashboard');
                                  }
                                },
                          child: isLoading
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Log in'),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed:
                              isLoading ? null : () => context.go('/register'),
                          child: const Text('Create account'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
