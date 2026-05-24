import 'package:flutter/material.dart';

import 'analytics_screen.dart';
import 'flagged_events_screen.dart';
import 'learner_list_screen.dart';

class InstructorShell extends StatefulWidget {
  const InstructorShell({super.key});

  @override
  State<InstructorShell> createState() => _InstructorShellState();
}

class _InstructorShellState extends State<InstructorShell>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Instructor'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.people), text: 'Learners'),
            Tab(icon: Icon(Icons.analytics), text: 'Analytics'),
            Tab(icon: Icon(Icons.flag), text: 'Flagged'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          LearnerListScreen(),
          AnalyticsScreen(),
          FlaggedEventsScreen(),
        ],
      ),
    );
  }
}
