import 'package:uuid/uuid.dart';

enum TaskPriority { low, medium, high }
enum TaskStatus { pending, inProgress, completed }

class Task {
  final String id;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final TaskPriority priority;
  final TaskStatus status;
  final List<SubTask> subtasks;
  final String? note;
  final DateTime createdAt;
  final String? listName;

  Task({
    String? id,
    required this.title,
    this.description,
    this.dueDate,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.pending,
    List<SubTask>? subtasks,
    this.note,
    DateTime? createdAt,
    this.listName,
  })  : id = id ?? const Uuid().v4(),
        subtasks = subtasks ?? [],
        createdAt = createdAt ?? DateTime.now();

  bool get isCompleted => status == TaskStatus.completed;
  
  int get completedSubtasks => subtasks.where((s) => s.isCompleted).length;
  
  double get progress {
    if (subtasks.isEmpty) return isCompleted ? 1.0 : 0.0;
    return completedSubtasks / subtasks.length;
  }

  static String getPriorityLabel(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.high:
        return 'High';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'dueDate': dueDate?.toIso8601String(),
      'priority': priority.index,
      'status': status.index,
      'subtasks': subtasks.map((s) => s.toJson()).toList(),
      'note': note,
      'createdAt': createdAt.toIso8601String(),
      'listName': listName,
    };
  }

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      dueDate: json['dueDate'] != null ? DateTime.parse(json['dueDate']) : null,
      priority: TaskPriority.values[json['priority']],
      status: TaskStatus.values[json['status']],
      subtasks: (json['subtasks'] as List?)
          ?.map((s) => SubTask.fromJson(s))
          .toList() ?? [],
      note: json['note'],
      createdAt: DateTime.parse(json['createdAt']),
      listName: json['listName'],
    );
  }

  Task copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? dueDate,
    TaskPriority? priority,
    TaskStatus? status,
    List<SubTask>? subtasks,
    String? note,
    DateTime? createdAt,
    String? listName,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      dueDate: dueDate ?? this.dueDate,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      subtasks: subtasks ?? this.subtasks,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
      listName: listName ?? this.listName,
    );
  }
}

class SubTask {
  final String id;
  final String title;
  final bool isCompleted;

  SubTask({
    String? id,
    required this.title,
    this.isCompleted = false,
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'isCompleted': isCompleted,
    };
  }

  factory SubTask.fromJson(Map<String, dynamic> json) {
    return SubTask(
      id: json['id'],
      title: json['title'],
      isCompleted: json['isCompleted'] ?? false,
    );
  }

  SubTask copyWith({
    String? id,
    String? title,
    bool? isCompleted,
  }) {
    return SubTask(
      id: id ?? this.id,
      title: title ?? this.title,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}
