import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/providers/auth_provider.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: AtlasMobileApp()));
}

class AtlasMobileApp extends ConsumerWidget {
  const AtlasMobileApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(authProvider);
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Atlas Learning',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.build(),
      routerConfig: router,
    );
  }
}
