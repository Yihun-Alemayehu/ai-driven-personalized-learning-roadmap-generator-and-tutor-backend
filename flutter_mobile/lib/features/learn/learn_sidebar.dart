import 'package:flutter/material.dart';

class LearnSidebar extends StatelessWidget {
  const LearnSidebar({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        children: const <Widget>[
          DrawerHeader(child: Text('Topics')),
          ListTile(title: Text('Introduction')),
          ListTile(title: Text('Core concepts')),
          ListTile(title: Text('Practice tasks')),
        ],
      ),
    );
  }
}
