import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses, BalanceReport } from '../contexts/ExpenseContext';
import { useRoommates } from '../contexts/RoommateContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

function Dashboard() {
  const { currentUser } = useAuth();
  const { expenses, calculateBalances } = useExpenses();
  const { roommates } = useRoommates();
  const navigate = useNavigate();
  const [balanceReport, setBalanceReport] = useState<BalanceReport>({
    balances: [],
    totalExpenses: 0,
    expensePerPerson: 0
  });
  
  const [recentExpenses, setRecentExpenses] = useState(expenses.slice(0, 5));

  const COLORS = ['#0D9488', '#7C3AED', '#F97316', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    const report = calculateBalances();
    setBalanceReport(report);

    // Sort expenses by date (newest first) and take the first 5
    const sorted = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);
    
    setRecentExpenses(sorted);
  }, [expenses, calculateBalances]);

  const currentUserBalance = balanceReport.balances.find(
    balance => balance.userId === currentUser?.id
  );

  // Category data for pie chart
  const categoryData = expenses.reduce((acc: { name: string, value: number }[], expense) => {
    const existingCategory = acc.find(item => item.name === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6">
      <motion.div 
        className="md:flex md:items-center md:justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Welcome, {currentUser?.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your shared expenses
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/expenses/add')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add expense
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Card 1: Total expenses */}
        <motion.div 
          variants={itemVariants}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      Rs{balanceReport.totalExpenses.toFixed(2)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/expenses')}
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                View all expenses
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Your balance */}
        <motion.div 
          variants={itemVariants}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {currentUserBalance?.netBalance >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-success-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-error-500" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Your Balance</dt>
                  <dd>
                    <div className={`text-lg font-medium ${
                      currentUserBalance?.netBalance >= 0 
                        ? 'text-success-500' 
                        : 'text-error-500'
                    }`}>
                      {currentUserBalance?.netBalance >= 0 ? '+' : ''}
                      Rs{currentUserBalance?.netBalance.toFixed(2) || '0.00'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/reports')}
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                View detailed report
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Per person */}
        <motion.div 
          variants={itemVariants}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-secondary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Per Person</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      Rs{balanceReport.expensePerPerson.toFixed(2)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <div className="font-medium text-gray-500 flex items-center">
                Split among {roommates.length} people
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Roommates */}
        <motion.div 
          variants={itemVariants}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-accent-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Roommates</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {roommates.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/roommates')}
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                Manage roommates
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Expense by category chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Expenses by Category</h3>
            <div className="mt-1 text-sm text-gray-500">
              Breakdown of your shared expenses
            </div>
            <div className="mt-4 h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">No expense data available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Expenses</h3>
            <div className="mt-1 text-sm text-gray-500">
              Your latest shared expenses
            </div>
            <div className="mt-4">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentExpenses.length > 0 ? (
                    recentExpenses.map((expense) => {
                      const paidBy = roommates.find(r => r.id === expense.paidBy);
                      return (
                        <li key={expense.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                expense.paidBy === currentUser?.id
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {paidBy?.name.charAt(0).toUpperCase() || '?'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expense.title}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                <span className="inline-flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {new Date(expense.date).toLocaleDateString()}
                                </span>
                                <span className="ml-3 inline-flex items-center">
                                  <Users className="mr-1 h-3 w-3" />
                                  Split with {expense.splitWith.length} people
                                </span>
                              </p>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                expense.paidBy === currentUser?.id
                                  ? 'bg-primary-100 text-primary-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                Rs{expense.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="py-8 text-center">
                      <p className="text-gray-500">No recent expenses</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button
                onClick={() => navigate('/expenses')}
                className="font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                View all expenses
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;