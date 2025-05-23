import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRoommates } from './RoommateContext';
import { useAuth } from './AuthContext';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
  description?: string;
  splitWith: string[];
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  getExpensesByMonth: (month: number, year: number) => Expense[];
  getExpensesByUser: (userId: string) => Expense[];
  calculateBalances: () => BalanceReport;
  isLoading: boolean;
}

export interface Balance {
  userId: string;
  name: string;
  owes: number;
  owed: number;
  netBalance: number;
}

export interface BalanceReport {
  balances: Balance[];
  totalExpenses: number;
  expensePerPerson: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { roommates } = useRoommates();
  const { currentUser } = useAuth();

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, isLoading]);

  const getVisibleExpenses = () => {
    if (!currentUser) return [];
    
    const acceptedRoommates = roommates.filter(r => r.status === 'accepted').map(r => r.id);
    return expenses.filter(expense => 
      acceptedRoommates.includes(expense.paidBy) || 
      expense.paidBy === currentUser.id
    );
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => 
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      )
    );
  };

  const getExpensesByMonth = (month: number, year: number) => {
    return getVisibleExpenses().filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });
  };

  const getExpensesByUser = (userId: string) => {
    return getVisibleExpenses().filter(expense => expense.paidBy === userId);
  };

  const calculateBalances = (): BalanceReport => {
    const acceptedRoommates = roommates.filter(r => r.status === 'accepted');
    if (acceptedRoommates.length === 0) {
      return { balances: [], totalExpenses: 0, expensePerPerson: 0 };
    }

    const visibleExpenses = getVisibleExpenses();
    const totalExpenses = visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expensePerPerson = totalExpenses / acceptedRoommates.length;
    
    const balances: Balance[] = acceptedRoommates.map(roommate => ({
      userId: roommate.id,
      name: roommate.name,
      owes: 0,
      owed: 0,
      netBalance: 0
    }));

    visibleExpenses.forEach(expense => {
      const payer = balances.find(balance => balance.userId === expense.paidBy);
      if (!payer) return;

      const splitAmount = expense.amount / expense.splitWith.length;
      
      payer.owed += expense.amount - splitAmount;
      
      expense.splitWith.forEach(userId => {
        if (userId === expense.paidBy) return;
        
        const roommate = balances.find(balance => balance.userId === userId);
        if (roommate) {
          roommate.owes += splitAmount;
        }
      });
    });

    balances.forEach(balance => {
      balance.netBalance = balance.owed - balance.owes;
    });

    return {
      balances,
      totalExpenses,
      expensePerPerson
    };
  };

  const value = {
    expenses: getVisibleExpenses(),
    addExpense,
    deleteExpense,
    updateExpense,
    getExpensesByMonth,
    getExpensesByUser,
    calculateBalances,
    isLoading
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}