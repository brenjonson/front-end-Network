"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Settings2, Check, Loader2, RefreshCw, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { fetchImapSettings, createImapSetting, testImapConnection, syncEmails, ImapSetting, ImapSettingCreate } from '../api/services/route';

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export default function ImapSettings() {
  const [settings, setSettings] = useState<ImapSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingOrSyncing, setIsTestingOrSyncing] = useState<{[key: number]: string}>({});
  const [message, setMessage] = useState<Message | null>(null);
  
  const [formData, setFormData] = useState<ImapSettingCreate>({
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchImapSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load IMAP settings:', err);
      setMessage({ 
        type: 'error', 
        text: 'ไม่สามารถโหลดการตั้งค่า IMAP ได้ โปรดลองใหม่อีกครั้ง'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      use_ssl: checked
    });
  };

  const handleSyncOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSyncOptions({
      ...syncOptions,
      [name]: parseInt(value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      setIsSubmitting(true);
      await createImapSetting(formData);
      
      setMessage({ 
        type: 'success', 
        text: 'เพิ่มการตั้งค่า IMAP สำเร็จ'
      });
      
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
      
      await loadSettings();
      
      // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to create IMAP setting:', err);
      setMessage({ 
        type: 'error', 
        text: 'ไม่สามารถเพิ่มการตั้งค่า IMAP ได้ โปรดตรวจสอบข้อมูลและลองใหม่อีกครั้ง'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async (id: number) => {
    try {
      setIsTestingOrSyncing(prev => ({ ...prev, [id]: 'testing' }));
      setMessage(null);
      
      const result = await testImapConnection(id);
      
      if (result.status === 'success') {
        setMessage({ 
          type: 'success', 
          text: 'เชื่อมต่อกับเซิร์ฟเวอร์ IMAP สำเร็จ'
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ IMAP ได้'
        });
      }
      
      // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to test IMAP connection:', err);
      setMessage({ 
        type: 'error', 
        text: 'เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ'
      });
    } finally {
      setIsTestingOrSyncing(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleSync = async (id: number) => {
    try {
      setIsTestingOrSyncing(prev => ({ ...prev, [id]: 'syncing' }));
      setMessage(null);
      
      await syncEmails(id, syncOptions.days_back, syncOptions.limit);
      
      setMessage({ 
        type: 'success', 
        text: 'เริ่มซิงค์อีเมลในเบื้องหลังแล้ว'
      });
      
      // อัปเดต last_sync ในข้อมูล
      setSettings(prevSettings => {
        return prevSettings.map(setting => {
          if (setting.id === id) {
            return {
              ...setting,
              last_sync: new Date().toISOString()
            };
          }
          return setting;
        });
      });
      
      // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to sync emails:', err);
      setMessage({ 
        type: 'error', 
        text: 'เกิดข้อผิดพลาดในการซิงค์อีเมล'
      });
    } finally {
      setIsTestingOrSyncing(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // ฟอร์แมตวันที่และเวลา
  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return 'ไม่เคยซิงค์';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'ไม่เคยซิงค์';
    }
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">การตั้งค่า IMAP</h1>
      
      {message && (
        <Alert className={
          message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
          message.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''
        }>
          <div className="flex items-center">
            {message.type === 'success' && <Check className="h-4 w-4 mr-2" />}
            {message.type === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
            {message.text}
          </div>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center"
        >
          {isFormVisible ? (
            <>
              <X className="h-4 w-4 mr-2" />
              ซ่อนฟอร์ม
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              เพิ่มการตั้งค่า IMAP
            </>
          )}
        </Button>
        
        <Button 
          variant="outline"
          onClick={loadSettings}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>
      
      {isFormVisible && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มการตั้งค่า IMAP</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    อีเมล <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="server">
                    เซิร์ฟเวอร์ IMAP <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="server"
                    name="server"
                    value={formData.server}
                    onChange={handleInputChange}
                    placeholder="imap.example.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="port">
                    พอร์ต <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    value={formData.port}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="username">
                    ชื่อผู้ใช้ <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="username หรือ email"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    รหัสผ่าน <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="folder">
                    โฟลเดอร์
                  </label>
                  <Input
                    id="folder"
                    name="folder"
                    value={formData.folder}
                    onChange={handleInputChange}
                    placeholder="INBOX"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="use_ssl"
                    checked={formData.use_ssl}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="use_ssl"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    ใช้ SSL
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : 'บันทึก'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* ตั้งค่าการซิงค์ */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าการซิงค์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="days_back">
                ดึงข้อมูลย้อนหลัง (วัน)
              </label>
              <Input
                id="days_back"
                name="days_back"
                type="number"
                value={syncOptions.days_back}
                onChange={handleSyncOptionsChange}
                min="1"
                max="3650"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="limit">
                จำนวนอีเมลสูงสุด
              </label>
              <Input
                id="limit"
                name="limit"
                type="number"
                value={syncOptions.limit}
                onChange={handleSyncOptionsChange}
                min="1"
                max="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* ตารางการตั้งค่า IMAP */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>อีเมล</TableHead>
                <TableHead>เซิร์ฟเวอร์</TableHead>
                <TableHead>พอร์ต</TableHead>
                <TableHead>ซิงค์ล่าสุด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length > 0 ? (
                settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.email}</TableCell>
                    <TableCell>{setting.server}</TableCell>
                    <TableCell>{setting.port}</TableCell>
                    <TableCell>{formatDateTime(setting.last_sync)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(setting.id)}
                          disabled={!!isTestingOrSyncing[setting.id]}
                        >
                          {isTestingOrSyncing[setting.id] === 'testing' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังทดสอบ...
                            </>
                          ) : 'ทดสอบ'}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSync(setting.id)}
                          disabled={!!isTestingOrSyncing[setting.id]}
                        >
                          {isTestingOrSyncing[setting.id] === 'syncing' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังซิงค์...
                            </>
                          ) : 'ซิงค์'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    ไม่พบการตั้งค่า IMAP
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}