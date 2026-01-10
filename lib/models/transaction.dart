import 'package:uuid/uuid.dart';

enum TransactionType { income, expense }

enum TransactionCategory {
  // Income
  salary,
  freelance,
  investment,
  gift,
  other_income,
  // Expense
  food,
  transport,
  shopping,
  entertainment,
  bills,
  health,
  education,
  subscription,
  other_expense,
}

class Transaction {
  final String id;
  final String title;
  final double amount;
  final TransactionType type;
  final TransactionCategory category;
  final DateTime date;
  final String? note;
  final String? icon;

  Transaction({
    String? id,
    required this.title,
    required this.amount,
    required this.type,
    required this.category,
    required this.date,
    this.note,
    this.icon,
  }) : id = id ?? const Uuid().v4();

  // Category Icons
  static String getCategoryIcon(TransactionCategory category) {
    switch (category) {
      case TransactionCategory.salary:
        return '💰';
      case TransactionCategory.freelance:
        return '💼';
      case TransactionCategory.investment:
        return '📈';
      case TransactionCategory.gift:
        return '🎁';
      case TransactionCategory.other_income:
        return '💵';
      case TransactionCategory.food:
        return '🍔';
      case TransactionCategory.transport:
        return '🚗';
      case TransactionCategory.shopping:
        return '🛒';
      case TransactionCategory.entertainment:
        return '🎮';
      case TransactionCategory.bills:
        return '📄';
      case TransactionCategory.health:
        return '💊';
      case TransactionCategory.education:
        return '📚';
      case TransactionCategory.subscription:
        return '📺';
      case TransactionCategory.other_expense:
        return '💸';
    }
  }

  static String getCategoryName(TransactionCategory category) {
    switch (category) {
      case TransactionCategory.salary:
        return 'Salary';
      case TransactionCategory.freelance:
        return 'Freelance';
      case TransactionCategory.investment:
        return 'Investment';
      case TransactionCategory.gift:
        return 'Gift';
      case TransactionCategory.other_income:
        return 'Other Income';
      case TransactionCategory.food:
        return 'Food & Drinks';
      case TransactionCategory.transport:
        return 'Transportation';
      case TransactionCategory.shopping:
        return 'Shopping';
      case TransactionCategory.entertainment:
        return 'Entertainment';
      case TransactionCategory.bills:
        return 'Bills';
      case TransactionCategory.health:
        return 'Health';
      case TransactionCategory.education:
        return 'Education';
      case TransactionCategory.subscription:
        return 'Subscription';
      case TransactionCategory.other_expense:
        return 'Other Expense';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'amount': amount,
      'type': type.index,
      'category': category.index,
      'date': date.toIso8601String(),
      'note': note,
      'icon': icon,
    };
  }

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      title: json['title'],
      amount: json['amount'].toDouble(),
      type: TransactionType.values[json['type']],
      category: TransactionCategory.values[json['category']],
      date: DateTime.parse(json['date']),
      note: json['note'],
      icon: json['icon'],
    );
  }

  Transaction copyWith({
    String? id,
    String? title,
    double? amount,
    TransactionType? type,
    TransactionCategory? category,
    DateTime? date,
    String? note,
    String? icon,
  }) {
    return Transaction(
      id: id ?? this.id,
      title: title ?? this.title,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      category: category ?? this.category,
      date: date ?? this.date,
      note: note ?? this.note,
      icon: icon ?? this.icon,
    );
  }
}
