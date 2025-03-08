import React, { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { fetchSummary, fetchMonthlyExpenses, fetchCategoriesExpenses } from '@/services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const summaryData = await fetchSummary();
        const monthlyExpenses = await fetchMonthlyExpenses();
        const categoriesExpenses = await fetchCategoriesExpenses();
        
        setSummary(summaryData);
        setMonthlyData(monthlyExpenses);
        setCategoriesData(categoriesExpenses);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลได้');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">แดชบอร์ด</h1>
      
      {/* สรุปค่าใช้จ่าย */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-bold">ค่าใช้จ่ายทั้งหมด</h3>
          <p className="text-3xl">{summary?.total_expense.toLocaleString()} บาท</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-bold">ค่าเฉลี่ยต่อเดือน</h3>
          <p className="text-3xl">{summary?.average_monthly.toLocaleString()} บาท</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-bold">จำนวนใบเสร็จ</h3>
          <p className="text-3xl">{summary?.receipt_count} ใบ</p>
        </Card>
      </div>
      
      {/* กราฟค่าใช้จ่ายรายเดือน */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">ค่าใช้จ่ายรายเดือน</h2>
        <div className="h-80">
          <LineChart
            data={monthlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* รายละเอียดของ LineChart */}
          </LineChart>
        </div>
      </Card>
      
      {/* กราฟค่าใช้จ่ายตามหมวดหมู่ */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">ค่าใช้จ่ายตามหมวดหมู่</h2>
        <div className="h-80">
          <PieChart width={400} height={300}>
            {/* รายละเอียดของ PieChart */}
          </PieChart>
        </div>
      </Card>
      
      <div className="mt-6">
        <Button onClick={() => window.location.href = '/receipts'}>
          ดูรายการใบเสร็จทั้งหมด
        </Button>
      </div>
    </div>
  );
}