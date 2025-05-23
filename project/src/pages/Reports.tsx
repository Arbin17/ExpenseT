import { useEffect, useState } from 'react';
import { useExpenses, BalanceReport } from '../contexts/ExpenseContext';
import { useRoommates } from '../contexts/RoommateContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  ArrowDown, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  BarChart2
} from 'lucide-react';

function Reports() {
  const { expenses, calculateBalances } = useExpenses();
  const { roommates } = useRoommates();
  const [balanceReport, setBalanceReport] = useState<BalanceReport>({
    balances: [],
    totalExpenses: 0,
    expensePerPerson: 0
  });
  
  // Prepare chart data
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const report = calculateBalances();
    setBalanceReport(report);

    // Prepare data for bar chart - who paid what
    const data = roommates.map(roommate => {
      const roommateExpenses = expenses.filter(e => e.paidBy === roommate.id);
      const totalPaid = roommateExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const balance = report.balances.find(b => b.userId === roommate.id);
      
      return {
        name: roommate.name,
        paid: totalPaid,
        owes: balance?.owes || 0,
        netBalance: balance?.netBalance || 0
      };
    });
    
    setChartData(data);
  }, [expenses, roommates, calculateBalances]);

  // Find who owes whom
  const settleDebts = () => {
    const debtors = balanceReport.balances
      .filter(balance => balance.netBalance < 0)
      .sort((a, b) => a.netBalance - b.netBalance);
    
    const creditors = balanceReport.balances
      .filter(balance => balance.netBalance > 0)
      .sort((a, b) => b.netBalance - a.netBalance);
    
    const transactions: { from: string; to: string; amount: number }[] = [];
    
    let i = 0;
    let j = 0;
    
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const debtAmount = Math.abs(debtor.netBalance);
      const creditAmount = creditor.netBalance;
      
      const transferAmount = Math.min(debtAmount, creditAmount);
      
      if (transferAmount > 0.01) { // Only show meaningful transfers (over 1 cent)
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: Number(transferAmount.toFixed(2))
        });
      }
      
      debtor.netBalance += transferAmount;
      creditor.netBalance -= transferAmount;
      
      if (Math.abs(debtor.netBalance) < 0.01) {
        i++;
      }
      
      if (Math.abs(creditor.netBalance) < 0.01) {
        j++;
      }
    }
    
    return transactions;
  };

  const transactions = settleDebts();

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
        className="md:flex md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Monthly Report
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review who owes what and how to settle balances
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary-500" />
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
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart2 className="h-6 w-6 text-accent-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Per Person</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      Rs{balanceReport.expensePerPerson.toFixed(2)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-warning-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">People Who Owe</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {balanceReport.balances.filter(b => b.netBalance < 0).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-success-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">People Owed Money</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {balanceReport.balances.filter(b => b.netBalance > 0).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg"
      >
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Summary</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of who paid what and who owes money
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `Rs${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="paid" name="Amount Paid" fill="#0D9488" />
                <Bar dataKey="owes" name="Amount Owed" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 bg-white shadow sm:rounded-lg"
      >
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Individual Balances</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed breakdown of who owes what
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {balanceReport.balances.map((balance) => (
                <li key={balance.userId} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        balance.netBalance > 0
                          ? 'bg-success-100 text-success-700'
                          : balance.netBalance < 0
                            ? 'bg-error-100 text-error-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {balance.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {balance.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {balance.netBalance > 0 
                          ? 'Is owed money' 
                          : balance.netBalance < 0 
                            ? 'Owes money' 
                            : 'Has a balanced account'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {balance.netBalance !== 0 && (
                        balance.netBalance > 0 ? (
                          <TrendingUp className="mr-1.5 h-5 w-5 text-success-500" />
                        ) : (
                          <TrendingDown className="mr-1.5 h-5 w-5 text-error-500" />
                        )
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        balance.netBalance > 0
                          ? 'bg-success-100 text-success-800'
                          : balance.netBalance < 0
                            ? 'bg-error-100 text-error-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {balance.netBalance > 0 ? '+' : ''}Rs{Math.abs(balance.netBalance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 bg-white shadow sm:rounded-lg"
      >
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">How to Settle Up</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Follow these payment instructions to settle all balances
          </p>
        </div>
        <div className="border-t border-gray-200">
          {transactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-error-100 text-error-700 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        {transaction.from.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{transaction.from}</span>
                      <ArrowRight className="mx-3 h-4 w-4 text-gray-400" />
                      <div className="bg-success-100 text-success-700 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        {transaction.to.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{transaction.to}</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All settled up!</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no outstanding balances to settle.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Reports;