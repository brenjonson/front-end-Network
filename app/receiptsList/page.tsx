import React, { useState, useEffect } from 'react';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { fetchReceipts, fetchCategories } from '@/services/api';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: null,
    dateTo: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const receiptsData = await fetchReceipts();
        const categoriesData = await fetchCategories();
        
        setReceipts(receiptsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // กรองใบเสร็จตามเงื่อนไข
  const filteredReceipts = receipts.filter(receipt => {
    // ตรวจสอบว่าตรงกับเงื่อนไขการค้นหาหรือไม่
    const matchesSearch = filters.search ? 
      receipt.vendor_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      receipt.email_subject.toLowerCase().includes(filters.search.toLowerCase()) :
      true;
    
    // ตรวจสอบว่าตรงกับหมวดหมู่หรือไม่
    const matchesCategory = filters.category ? 
      receipt.category_id === parseInt(filters.category) : 
      true;
    
    // ตรวจสอบว่าอยู่ในช่วงวันที่หรือไม่
    const receiptDate = new Date(receipt.receipt_date);
    const matchesDateFrom = filters.dateFrom ? 
      receiptDate >= filters.dateFrom : 
      true;
    const matchesDateTo = filters.dateTo ? 
      receiptDate <= filters.dateTo : 
      true;
    
    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const columns = [
    {
      title: 'วันที่',
      key: 'receipt_date',
      render: (receipt) => new Date(receipt.receipt_date).toLocaleDateString('th-TH')
    },
    {
      title: 'ผู้ให้บริการ',
      key: 'vendor_name',
      dataIndex: 'vendor_name'
    },
    {
      title: 'จำนวนเงิน',
      key: 'amount',
      render: (receipt) => `${receipt.amount.toLocaleString()} ${receipt.currency}`
    },
    {
      title: 'หมวดหมู่',
      key: 'category',
      render: (receipt) => {
        const category = categories.find(c => c.id === receipt.category_id);
        return category ? category.name : 'ไม่ระบุ';
      }
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: (receipt) => (
        <Button onClick={() => window.location.href = `/receipts/${receipt.id}`}>
          ดูรายละเอียด
        </Button>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">รายการใบเสร็จทั้งหมด</h1>
      
      {/* ตัวกรอง */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">ค้นหา</label>
            <Input
              placeholder="ชื่อผู้ให้บริการ หรือหัวข้อ"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div>
            <label className="block mb-1">หมวดหมู่</label>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">ทั้งหมด</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block mb-1">ตั้งแต่วันที่</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {filters.dateFrom ? (
                    format(filters.dateFrom, 'PPP', { locale: th })
                  ) : (
                    <span>เลือกวันที่เริ่มต้น</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters({...filters, dateFrom: date})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block mb-1">ถึงวันที่</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {filters.dateTo ? (
                    format(filters.dateTo, 'PPP', { locale: th })
                  ) : (
                    <span>เลือกวันที่สิ้นสุด</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters({...filters, dateTo: date})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      {/* ตารางรายการ */}
      <Table
        dataSource={filteredReceipts}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}