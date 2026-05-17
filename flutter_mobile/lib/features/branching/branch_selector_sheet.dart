import 'package:flutter/material.dart';

class BranchSelectorSheet extends StatelessWidget {
  const BranchSelectorSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Text(
            'Choose next path',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          const ListTile(
            title: Text('Applied track'),
            subtitle: Text('Hands-on practical route'),
          ),
          const ListTile(
            title: Text('Theory track'),
            subtitle: Text('Deep conceptual route'),
          ),
        ],
      ),
    );
  }
}
