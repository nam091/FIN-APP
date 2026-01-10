import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/task.dart';

class TaskProvider with ChangeNotifier {
  List<Task> _tasks = [];
  bool _isLoading = false;
  String _selectedFilter = 'all';

  List<Task> get tasks => _tasks;
  bool get isLoading => _isLoading;
  String get selectedFilter => _selectedFilter;

  // Filtered Tasks
  List<Task> get filteredTasks {
    switch (_selectedFilter) {
      case 'today':
        return todayTasks;
      case 'upcoming':
        return upcomingTasks;
      case 'completed':
        return completedTasks;
      default:
        return _tasks;
    }
  }

  List<Task> get todayTasks {
    final now = DateTime.now();
    return _tasks.where((t) =>
        t.dueDate != null &&
        t.dueDate!.day == now.day &&
        t.dueDate!.month == now.month &&
        t.dueDate!.year == now.year &&
        !t.isCompleted).toList();
  }

  List<Task> get upcomingTasks {
    final now = DateTime.now();
    return _tasks.where((t) =>
        t.dueDate != null &&
        t.dueDate!.isAfter(now) &&
        !t.isCompleted).toList()
      ..sort((a, b) => a.dueDate!.compareTo(b.dueDate!));
  }

  List<Task> get completedTasks {
    return _tasks.where((t) => t.isCompleted).toList();
  }

  List<Task> get pendingTasks {
    return _tasks.where((t) => !t.isCompleted).toList();
  }

  int get completedCount => completedTasks.length;
  int get pendingCount => pendingTasks.length;

  void setFilter(String filter) {
    _selectedFilter = filter;
    notifyListeners();
  }

  // CRUD Operations
  Future<void> loadTasks() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? data = prefs.getString('tasks');
      
      if (data != null) {
        final List<dynamic> jsonList = json.decode(data);
        _tasks = jsonList.map((j) => Task.fromJson(j)).toList();
      } else {
        _tasks = _getSampleTasks();
        await _saveTasks();
      }
    } catch (e) {
      debugPrint('Error loading tasks: $e');
      _tasks = _getSampleTasks();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addTask(Task task) async {
    _tasks.add(task);
    await _saveTasks();
    notifyListeners();
  }

  Future<void> updateTask(Task task) async {
    final index = _tasks.indexWhere((t) => t.id == task.id);
    if (index != -1) {
      _tasks[index] = task;
      await _saveTasks();
      notifyListeners();
    }
  }

  Future<void> toggleTaskStatus(String id) async {
    final index = _tasks.indexWhere((t) => t.id == id);
    if (index != -1) {
      final task = _tasks[index];
      _tasks[index] = task.copyWith(
        status: task.isCompleted ? TaskStatus.pending : TaskStatus.completed,
      );
      await _saveTasks();
      notifyListeners();
    }
  }

  Future<void> toggleSubtask(String taskId, String subtaskId) async {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = _tasks[taskIndex];
      final subtasks = task.subtasks.map((s) {
        if (s.id == subtaskId) {
          return s.copyWith(isCompleted: !s.isCompleted);
        }
        return s;
      }).toList();
      
      _tasks[taskIndex] = task.copyWith(subtasks: subtasks);
      await _saveTasks();
      notifyListeners();
    }
  }

  Future<void> addSubtask(String taskId, SubTask subtask) async {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = _tasks[taskIndex];
      final subtasks = [...task.subtasks, subtask];
      _tasks[taskIndex] = task.copyWith(subtasks: subtasks);
      await _saveTasks();
      notifyListeners();
    }
  }

  Future<void> deleteTask(String id) async {
    _tasks.removeWhere((t) => t.id == id);
    await _saveTasks();
    notifyListeners();
  }

  Future<void> _saveTasks() async {
    final prefs = await SharedPreferences.getInstance();
    final String data = json.encode(_tasks.map((t) => t.toJson()).toList());
    await prefs.setString('tasks', data);
  }

  List<Task> _getSampleTasks() {
    final now = DateTime.now();
    return [
      Task(
        title: 'Update project documentation',
        description: 'Review and update all project docs',
        dueDate: now.add(const Duration(hours: 2)),
        priority: TaskPriority.high,
        listName: 'Getting Started',
        subtasks: [
          SubTask(title: 'Draft introduction', isCompleted: true),
          SubTask(title: 'Review technical specs', isCompleted: true),
          SubTask(title: 'Create visual diagrams'),
          SubTask(title: 'Get feedback from marketing'),
        ],
      ),
      Task(
        title: 'Check recurring payments',
        description: 'Review all monthly subscriptions',
        dueDate: now.add(const Duration(days: 1)),
        priority: TaskPriority.medium,
        listName: 'Finance',
        status: TaskStatus.completed,
      ),
      Task(
        title: 'Call with marketing team',
        description: 'Discuss Q1 campaign strategy',
        dueDate: now.add(const Duration(hours: 4)),
        priority: TaskPriority.high,
        listName: 'Meetings',
      ),
      Task(
        title: 'Create your first list',
        dueDate: now.add(const Duration(days: 2)),
        priority: TaskPriority.low,
        listName: 'Getting Started',
      ),
      Task(
        title: 'Tap anywhere and just start typing',
        listName: 'Getting Started',
      ),
    ];
  }
}
