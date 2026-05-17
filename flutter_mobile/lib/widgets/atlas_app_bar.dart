import 'package:flutter/material.dart';

import '../core/theme/app_colors.dart';

class AtlasAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AtlasAppBar({
    required this.title,
    this.actions,
    this.leading,
    super.key,
  });

  final String title;
  final List<Widget>? actions;
  final Widget? leading;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      leading: leading,
      actions: actions,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child:
            Divider(height: 1, color: AppColors.border.withValues(alpha: 0.7)),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 1);
}
