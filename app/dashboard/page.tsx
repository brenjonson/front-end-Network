"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
// import { fetchSummary, fetchMonthlyExpenses, fetchCategoriesExpenses } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

interface SummaryData {
  total_expense: number;
  average_monthly: number;
  receipt_count: number;
}

interface MonthlyData {
  month: number;
  month_name: string;
  year: number;
  total: number;
}

interface CategoryData {
  category_name: string;
  total: number;
  percentage: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // กำหนดสีสำหรับกราฟวงกลม
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0'];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // ดึงข้อมูลสรุป
        const summaryData = await fetchSummary();
        
        // ดึงข้อมูลรายเดือน
        const monthlyExpenses = await fetchMonthlyExpenses();
        
        // ดึงข้อมูลหมวดหมู่
        const categoriesExpenses = await fetchCategoriesExpenses();
        
        setSummary(summaryData);
        setMonthlyData(monthlyExpenses);
        setCategoriesData(categoriesExpenses);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ โปรดลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // แปลงข้อมูลสำหรับแสดงในกราฟเส้น
  const formatMonthlyData = () => {
    return monthlyData.map(item => ({
      name: item.month_name,
      ค่าใช้จ่าย: item.total
    })).reverse(); // กลับลำดับให้เรียงจากเก่าไปใหม่
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="my-6">
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          ลองใหม่
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
      
      {/* สรุปข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ค่าใช้จ่ายทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.total_expense?.toLocaleString() || 0} บาท
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              จากใบเสร็จทั้งหมด {summary?.receipt_count || 0} รายการ
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ค่าเฉลี่ยต่อเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.average_monthly?.toLocaleString() || 0} บาท
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              จากข้อมูล {monthlyData.length} เดือนที่ผ่านมา
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">จำนวนใบเสร็จ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.receipt_count || 0} ใบ
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ที่ถูกจัดเก็บในระบบ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* กราฟข้อมูลรายเดือน */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>ค่าใช้จ่ายรายเดือน</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatMonthlyData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  style={{ fontSize: '0.8rem' }}
                />
                <YAxis 
                  style={{ fontSize: '0.8rem' }}
                  tickFormatter={(value) => `${value.toLocaleString()} บาท`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} บาท`, 'ค่าใช้จ่าย']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ค่าใช้จ่าย" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">ไม่มีข้อมูลค่าใช้จ่ายรายเดือน</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* กราฟหมวดหมู่ */}
      <Card>
        <CardHeader>
          <CardTitle>ค่าใช้จ่ายตามหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {categoriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="category_name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoriesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()} บาท`} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">ไม่มีข้อมูลค่าใช้จ่ายตามหมวดหมู่</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Button onClick={() => window.location.href = '/receiptsList'}>
          ดูรายการใบเสร็จทั้งหมด
        </Button>
      </div>
    </div>
  );
}