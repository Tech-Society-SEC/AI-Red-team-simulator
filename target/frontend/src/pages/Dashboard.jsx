import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../api/supabaseClient";
import { getAnalytics, getTransactions, getBudgets, getGoals, getInsights, getProfile } from "../api/api";
import { 
  Navbar, 
  StatCard, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  ChartContainer, 
  LoadingSkeleton,
  EmptyState,
  Badge,
  ProgressBar,
  RingProgress
} from "../components/ui";
import UploadCSV from "../components/UploadCSV";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target, 
  AlertCircle,
  Upload,
  MessageSquare,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      setUser(user);
      setLoading(false);
      loadDashboardData();
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/");
      } else if (session) {
        setUser(session.user);
        setLoading(false);
        loadDashboardData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, transactionsRes, budgetsRes, goalsRes, insightsRes, profileRes] = await Promise.all([
        getAnalytics(),
        getTransactions({ page_size: 5 }),
        getBudgets(),
        getGoals(),
        getInsights(),
        getProfile()
      ]);

      setAnalytics(analyticsRes);
      setRecentTransactions(transactionsRes.transactions || []);
      setBudgets(budgetsRes.budgets || []);
      setGoals(goalsRes.goals || []);
      setInsights(insightsRes.insights || []);
      setUserProfile(profileRes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSpendingByCategoryData = () => {
    if (!analytics?.spending_by_category) return [];
    
    return Object.entries(analytics.spending_by_category).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  };

  const getBudgetProgressData = () => {
    return budgets.map(budget => ({
      ...budget,
      progress: budget.spent_amount ? (budget.spent_amount / budget.limit) * 100 : 0,
      status: budget.spent_amount > budget.limit ? 'exceeded' : 
              budget.spent_amount > budget.limit * 0.8 ? 'warning' : 'good'
    }));
  };

  const getGoalProgressData = () => {
    return goals.map(goal => ({
      ...goal,
      progress: goal.current_amount ? (goal.current_amount / goal.target_amount) * 100 : 0
    }));
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-dark-gradient">
        <Navbar 
          title="Finance Dashboard" 
          user={userProfile?.profile} 
          onLogout={handleLogout}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} lines={3} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSkeleton lines={8} className="h-96" />
            <LoadingSkeleton lines={8} className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Navbar 
        title="Finance Dashboard" 
        user={userProfile?.profile} 
        onLogout={handleLogout}
        onSettings={() => navigate("/settings")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <Button
          onClick={() => navigate("/chat")}
            variant="primary"
            icon={<MessageSquare className="w-4 h-4" />}
        >
          💬 Chat Assistant
          </Button>
          <Button
            onClick={() => navigate("/management")}
            variant="secondary"
            icon={<BarChart3 className="w-4 h-4" />}
          >
            📊 Manage
          </Button>
          <Button
            onClick={() => navigate("/settings")}
            variant="ghost"
            icon={<Settings className="w-4 h-4" />}
          >
            ⚙️ Settings
          </Button>
          <UploadCSV />
        </motion.div>

        {/* KPI Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Income"
              value={formatCurrency(analytics.income || 0)}
              icon={<TrendingUp className="w-6 h-6" />}
              trend="up"
              trendValue="+12% from last month"
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(analytics.expense || 0)}
              icon={<TrendingDown className="w-6 h-6" />}
              trend="down"
              trendValue="-5% from last month"
            />
            <StatCard
              title="Net Balance"
              value={formatCurrency((analytics.income || 0) - (analytics.expense || 0))}
              icon={<DollarSign className="w-6 h-6" />}
              trend={(analytics.income || 0) - (analytics.expense || 0) > 0 ? "up" : "down"}
              trendValue={(analytics.income || 0) - (analytics.expense || 0) > 0 ? "Positive" : "Negative"}
            />
            <StatCard
              title="Transactions"
              value={recentTransactions.length.toString()}
              subtitle="Recent transactions"
              icon={<CreditCard className="w-6 h-6" />}
            />
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending by Category */}
          <ChartContainer title="Spending by Category" subtitle="Your expenses breakdown">
            {getSpendingByCategoryData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getSpendingByCategoryData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getSpendingByCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon="📊"
                title="No spending data"
                description="Upload transactions or add them manually to see your spending breakdown"
                action={<Button onClick={() => navigate("/transactions")}>Add Transactions</Button>}
              />
            )}
          </ChartContainer>

          {/* Recent Transactions */}
          <ChartContainer title="Recent Transactions" subtitle="Your latest financial activity">
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-success-500/20' : 'bg-error-500/20'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-4 h-4 text-success-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-error-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{transaction.description}</p>
                        <p className="text-xs text-gray-400">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'credit' ? 'text-success-400' : 'text-error-400'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.txn_date).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="💳"
                title="No recent transactions"
                description="Start by adding some transactions to track your spending"
                action={<Button onClick={() => navigate("/transactions")}>Add Transaction</Button>}
              />
            )}
          </ChartContainer>
        </div>

        {/* Budgets and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budgets */}
          <ChartContainer title="Budget Overview" subtitle="Track your spending limits">
            {getBudgetProgressData().length > 0 ? (
              <div className="space-y-4">
                {getBudgetProgressData().map((budget, index) => (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-200">{budget.category}</span>
                      <Badge 
                        variant={budget.status === 'exceeded' ? 'error' : 
                                budget.status === 'warning' ? 'warning' : 'success'}
                      >
                        {budget.status === 'exceeded' ? 'Exceeded' : 
                         budget.status === 'warning' ? 'Warning' : 'On Track'}
                      </Badge>
                    </div>
                    <ProgressBar
                      value={budget.progress}
                      max={100}
                      color={budget.status === 'exceeded' ? 'error' : 
                             budget.status === 'warning' ? 'warning' : 'success'}
                      label={`${formatCurrency(budget.spent_amount || 0)} / ${formatCurrency(budget.limit)}`}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="💰"
                title="No budgets set"
                description="Create budgets to track your spending limits"
                action={<Button onClick={() => navigate("/management")}>Set Budgets</Button>}
              />
            )}
          </ChartContainer>

          {/* Goals */}
          <ChartContainer title="Financial Goals" subtitle="Track your savings progress">
            {getGoalProgressData().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getGoalProgressData().map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 bg-white/5 rounded-lg"
                  >
                    <RingProgress
                      value={goal.progress}
                      size={80}
                      color="primary"
                    >
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{Math.round(goal.progress)}%</p>
                      </div>
                    </RingProgress>
                    <h4 className="text-sm font-medium text-gray-200 mt-2">{goal.name}</h4>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🎯"
                title="No goals set"
                description="Set financial goals to track your savings progress"
                action={<Button onClick={() => navigate("/management")}>Set Goals</Button>}
              />
            )}
          </ChartContainer>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <ChartContainer title="AI Insights" subtitle="Personalized financial advice">
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-200 mb-1">
                        {insight.type?.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-300">{insight.summary}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}