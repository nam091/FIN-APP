import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/transaction.dart';

class FinanceProvider with ChangeNotifier {
  List<Transaction> _transactions = [];
  bool _isLoading = false;

  List<Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;

  // Calculated values
  double get totalBalance => totalIncome - totalExpense;
  
  double get totalIncome => _transactions
      .where((t) => t.type == TransactionType.income)
      .fold(0.0, (sum, t) => sum + t.amount);
  
  double get totalExpense => _transactions
      .where((t) => t.type == TransactionType.expense)
      .fold(0.0, (sum, t) => sum + t.amount);

  double get monthlyIncome {
    final now = DateTime.now();
    return _transactions
        .where((t) => 
            t.type == TransactionType.income &&
            t.date.month == now.month &&
            t.date.year == now.year)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  double get monthlyExpense {
    final now = DateTime.now();
    return _transactions
        .where((t) => 
            t.type == TransactionType.expense &&
            t.date.month == now.month &&
            t.date.year == now.year)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  List<Transaction> get recentTransactions {
    final sorted = List<Transaction>.from(_transactions)
      ..sort((a, b) => b.date.compareTo(a.date));
    return sorted.take(10).toList();
  }

  // Monthly data for charts
  List<double> getMonthlyData(TransactionType type) {
    final now = DateTime.now();
    final List<double> monthlyData = List.filled(12, 0.0);
    
    for (var t in _transactions.where((t) => t.type == type && t.date.year == now.year)) {
      monthlyData[t.date.month - 1] += t.amount;
    }
    
    return monthlyData;
  }

  // Weekly data for charts (last 7 days)
  List<double> getWeeklyData(TransactionType type) {
    final now = DateTime.now();
    final List<double> weeklyData = List.filled(7, 0.0);
    
    for (var i = 0; i < 7; i++) {
      final day = now.subtract(Duration(days: 6 - i));
      final dayTotal = _transactions
          .where((t) =>
              t.type == type &&
              t.date.day == day.day &&
              t.date.month == day.month &&
              t.date.year == day.year)
          .fold(0.0, (sum, t) => sum + t.amount);
      weeklyData[i] = dayTotal;
    }
    
    return weeklyData;
  }

  // Category breakdown
  Map<TransactionCategory, double> getCategoryBreakdown(TransactionType type) {
    final Map<TransactionCategory, double> breakdown = {};
    
    for (var t in _transactions.where((t) => t.type == type)) {
      breakdown[t.category] = (breakdown[t.category] ?? 0) + t.amount;
    }
    
    return breakdown;
  }

  // CRUD Operations
  Future<void> loadTransactions() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? data = prefs.getString('transactions');
      
      if (data != null) {
        final List<dynamic> jsonList = json.decode(data);
        _transactions = jsonList.map((j) => Transaction.fromJson(j)).toList();
      } else {
        // Add sample data for demo
        _transactions = _getSampleTransactions();
        await _saveTransactions();
      }
    } catch (e) {
      debugPrint('Error loading transactions: $e');
      _transactions = _getSampleTransactions();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addTransaction(Transaction transaction) async {
    _transactions.add(transaction);
    await _saveTransactions();
    notifyListeners();
  }

  Future<void> updateTransaction(Transaction transaction) async {
    final index = _transactions.indexWhere((t) => t.id == transaction.id);
    if (index != -1) {
      _transactions[index] = transaction;
      await _saveTransactions();
      notifyListeners();
    }
  }

  Future<void> deleteTransaction(String id) async {
    _transactions.removeWhere((t) => t.id == id);
    await _saveTransactions();
    notifyListeners();
  }

  Future<void> _saveTransactions() async {
    final prefs = await SharedPreferences.getInstance();
    final String data = json.encode(_transactions.map((t) => t.toJson()).toList());
    await prefs.setString('transactions', data);
  }

  List<Transaction> _getSampleTransactions() {
    final now = DateTime.now();
    return [
      Transaction(
        title: 'Salary',
        amount: 5200,
        type: TransactionType.income,
        category: TransactionCategory.salary,
        date: now.subtract(const Duration(days: 2)),
      ),
      Transaction(
        title: 'Burger King',
        amount: 12.50,
        type: TransactionType.expense,
        category: TransactionCategory.food,
        date: now,
      ),
      Transaction(
        title: 'Netflix Subscription',
        amount: 15.99,
        type: TransactionType.expense,
        category: TransactionCategory.subscription,
        date: now.subtract(const Duration(days: 1)),
      ),
      Transaction(
        title: 'Freelance Project',
        amount: 850,
        type: TransactionType.income,
        category: TransactionCategory.freelance,
        date: now.subtract(const Duration(days: 5)),
      ),
      Transaction(
        title: 'Grocery Shopping',
        amount: 87.30,
        type: TransactionType.expense,
        category: TransactionCategory.shopping,
        date: now.subtract(const Duration(days: 3)),
      ),
      Transaction(
        title: 'Uber Trip',
        amount: 14.50,
        type: TransactionType.expense,
        category: TransactionCategory.transport,
        date: now.subtract(const Duration(days: 1)),
      ),
    ];
  }
}
