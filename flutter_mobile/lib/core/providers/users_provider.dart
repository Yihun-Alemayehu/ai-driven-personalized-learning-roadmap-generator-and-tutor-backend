import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../api/users_api.dart';
import '../models/user.dart';
final usersApiProvider = Provider<UsersApi>(
  (ref) => UsersApi(ref.watch(apiClientProvider).dio),
);

final usersProvider = FutureProvider<User>((ref) async {
  final api = ref.watch(usersApiProvider);
  return api.getMe();
});
