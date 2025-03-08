import React, { useState, useEffect } from 'react';
import { Table } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import { fetchImapSettings, createImapSetting, testImapConnection, syncEmails } from '@/services/api';;

export default function ImapSettings() {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    server: '',
    port: 993,
    username: '',
    password: '',
    use_ssl: true,
    folder: 'INBOX'
  });
  const [syncOptions, setSyncOptions] = useState({
    days_back: 30,
    limit: 50
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchImapSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดการตั้งค่า IMAP ได้' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createImapSetting(formData);
      setMessage({ type: 'success', text: 'เพิ่มการตั้งค่า IMAP สำเร็จ' });
      setIsFormVisible(false);
      setFormData({
        email: '',
        server: '',
        port: 993,
        username: '',
        password: '',
        use_ssl: true,
        folder: 'INBOX'
      });
      loadSettings();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'ไม่สามารถเพิ่มการตั้งค่า IMAP ได้' });
    }
  };

  const handleTest = async (id) => {
    try {
      const result = await testImapConnection(id);
      if (result.status === 'success') {
        setMessage({ type: 'success', text: 'เชื่อมต่อกับเซิร์ฟเวอร์ IMAP สำเร็จ' });
      } else {
        setMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ IMAP ได้' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ' });
    }
  };

  const handleSync = async (id) => {
    try {
      await syncEmails(id, syncOptions.days_back, syncOptions.limit);
      setMessage({ type: 'success', text: 'เริ่มซิงค์อีเมลในเบื้องหลังแล้ว' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการซิงค์อีเมล' });
    }
  };

  const columns = [
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'เซิร์ฟเวอร์',
      dataIndex: 'server',
      key: 'server'
    },
    {
      title: 'พอร์ต',
      dataIndex: 'port',
      key: 'port'
    },
    {
      title: 'ซิงค์ล่าสุด',
      key: 'last_sync',
      render: (record) => record.last_sync ? 
        new Date(record.last_sync).toLocaleString('th-TH') : 
        'ไม่เคยซิงค์'
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: (record) => (
        <div className="flex gap-2">
          <Button onClick={() => handleTest(record.id)}>ทดสอบ</Button>
          <Button onClick={() => handleSync(record.id)}>ซิงค์</Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">การตั้งค่า IMAP</h1>
      
      {message && (
        <Alert 
          type={message.type} 
          className="mb-4"
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      
      <div className="mb-4">
        <Button onClick={() => setIsFormVisible(!isFormVisible)}>
          {isFormVisible ? 'ซ่อนฟอร์ม' : 'เพิ่มการตั้งค่า IMAP'}
        </Button>
      </div>
      
      {isFormVisible && (
        <Card className="p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">เพิ่มการตั้งค่า IMAP</h2>
          
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">อีเมล</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">เซิร์ฟเวอร์</label>
                <Input
                  required
                  value={formData.server}
                  onChange={(e) => setFormData({...formData, server: e.target.value})}
                  placeholder="เช่น imap.gmail.com"
                />
              </div>
              
              <div>
                <label className="block mb-1">พอร์ต</label>
                <Input
                  required
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block mb-1">ชื่อผู้ใช้</label>
                <Input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">รหัสผ่าน</label>
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1">โฟลเดอร์</label>
                <Input
                  value={formData.folder}
                  onChange={(e) => setFormData({...formData, folder: e.target.value})}
                  placeholder="INBOX"
                />
              </div>
              
              <div className="flex items-center">
                <Checkbox
                  checked={formData.use_ssl}
                  onChange={(e) => setFormData({...formData, use_ssl: e.target.checked})}
                />
                <label className="ml-2">ใช้ SSL</label>
              </div>
            </div>
            
            <div className="mt-4">
              <Button type="submit">บันทึก</Button>
            </div>
          </Form>
        </Card>
      )}
      
      {/* ตั้งค่าการซิงค์ */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">ตั้งค่าการซิงค์</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">ดึงข้อมูลย้อนหลัง (วัน)</label>
            <Input
              type="number"
              value={syncOptions.days_back}
              onChange={(e) => setSyncOptions({...syncOptions, days_back: parseInt(e.target.value)})}
              min="1"
              max="3650"
            />
          </div>
          
          <div>
            <label className="block mb-1">จำนวนอีเมลสูงสุด</label>
            <Input
              type="number"
              value={syncOptions.limit}
              onChange={(e) => setSyncOptions({...syncOptions, limit: parseInt(e.target.value)})}
              min="1"
              max="1000"
            />
          </div>
        </div>
      </Card>
      
      {/* ตารางการตั้งค่า IMAP */}
      <Table
        dataSource={settings}
        columns={columns}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
}