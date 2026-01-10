import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/note.dart';

class NoteProvider with ChangeNotifier {
  List<Note> _notes = [];
  bool _isLoading = false;

  List<Note> get notes => _notes;
  bool get isLoading => _isLoading;

  List<Note> get pinnedNotes => _notes.where((n) => n.isPinned).toList();
  List<Note> get unpinnedNotes => _notes.where((n) => !n.isPinned).toList();

  List<Note> get sortedNotes {
    final pinned = pinnedNotes..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    final unpinned = unpinnedNotes..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return [...pinned, ...unpinned];
  }

  Note? getLatestNote() {
    if (_notes.isEmpty) return null;
    return sortedNotes.first;
  }

  // CRUD Operations
  Future<void> loadNotes() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final String? data = prefs.getString('notes');
      
      if (data != null) {
        final List<dynamic> jsonList = json.decode(data);
        _notes = jsonList.map((j) => Note.fromJson(j)).toList();
      } else {
        _notes = _getSampleNotes();
        await _saveNotes();
      }
    } catch (e) {
      debugPrint('Error loading notes: $e');
      _notes = _getSampleNotes();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> addNote(Note note) async {
    _notes.add(note);
    await _saveNotes();
    notifyListeners();
  }

  Future<void> updateNote(Note note) async {
    final index = _notes.indexWhere((n) => n.id == note.id);
    if (index != -1) {
      _notes[index] = note;
      await _saveNotes();
      notifyListeners();
    }
  }

  Future<void> togglePinNote(String id) async {
    final index = _notes.indexWhere((n) => n.id == id);
    if (index != -1) {
      final note = _notes[index];
      _notes[index] = note.copyWith(isPinned: !note.isPinned);
      await _saveNotes();
      notifyListeners();
    }
  }

  Future<void> deleteNote(String id) async {
    _notes.removeWhere((n) => n.id == id);
    await _saveNotes();
    notifyListeners();
  }

  Future<void> _saveNotes() async {
    final prefs = await SharedPreferences.getInstance();
    final String data = json.encode(_notes.map((n) => n.toJson()).toList());
    await prefs.setString('notes', data);
  }

  List<Note> _getSampleNotes() {
    return [
      Note(
        title: 'Welcome to Notes',
        content: 'All your tasks and notes in one place. Using our workspace feels as natural and fast as using pen and paper.\n\nA nice way to get started:\n• Tap the checkmark to complete this task\n• Tap anywhere and just start typing\n• Add due dates by typing phrases like "Tomorrow" or "Monday at 10am"',
        isPinned: true,
      ),
      Note(
        title: 'Project Goals & Strategy',
        content: 'The objective for Q4 is to streamline the execution hub for V2. Focus on high-fidelity interactions and seamless transitions.\n\n• Reduce latency in real-time syncing\n• Implement drag-and-drop for the Gantt view\n• Dark mode first approach',
      ),
      Note(
        title: 'Quick Note',
        content: 'Remember to call the bank tomorrow about the investment account.',
      ),
    ];
  }
}
