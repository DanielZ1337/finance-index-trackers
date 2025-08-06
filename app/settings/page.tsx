'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Trash2, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { AuthenticatedLayout } from '@/components/authenticated-layout';

export default function SettingsPage() {
    const { data: session, isPending } = useSession();
    const { theme, setTheme } = useTheme();

    // Settings state
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false,
        security: true
    });

    const [privacy, setPrivacy] = useState({
        profilePublic: false,
        showEmail: false,
        allowIndexing: true
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');    if (isPending) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!session) {
        return (
            <AuthenticatedLayout>
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <Settings className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p>Please sign in to access settings</p>
                            <Button asChild>
                                <a href="/sign-in">Sign In</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    const handleSaveSettings = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage('Settings saved successfully');
            setMessageType('success');
        } catch (error) {
            setMessage('Failed to save settings. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = async () => {
        setIsLoading(true);
        try {
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create and download a sample JSON file
            const data = {
                user: session.user,
                exportDate: new Date().toISOString(),
                data: "Your data would be exported here..."
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'user-data-export.json';
            a.click();
            URL.revokeObjectURL(url);

            setMessage('Data exported successfully');
            setMessageType('success');
        } catch (error) {
            setMessage('Failed to export data. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion would be processed here.');
        }
    };

    return (
        <AuthenticatedLayout title="Settings">
            <div className="space-y-6">
                {/* Description */}
                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        Manage your account preferences and application settings
                    </p>
                </div>

                {message && (
                    <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                        {messageType === 'error' ? (
                            <AlertTriangle className="h-4 w-4" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {/* Tabs Navigation */}
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="privacy">Privacy</TabsTrigger>
                        <TabsTrigger value="data">Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        {/* Appearance Settings */}
                        <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Palette className="h-5 w-5" />
                                        <CardTitle>Appearance</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Customize how the application looks and feels
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-base">Theme</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Choose your preferred theme
                                            </p>
                                        </div>
                                        <Select value={theme} onValueChange={setTheme}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">
                                                    <div className="flex items-center gap-2">
                                                        <Sun className="h-4 w-4" />
                                                        Light
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="dark">
                                                    <div className="flex items-center gap-2">
                                                        <Moon className="h-4 w-4" />
                                                        Dark
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="system">
                                                    <div className="flex items-center gap-2">
                                                        <Monitor className="h-4 w-4" />
                                                        System
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Language Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Language & Region</CardTitle>
                                    <CardDescription>
                                        Set your language and regional preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Language</Label>
                                            <Select defaultValue="en">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="es">Español</SelectItem>
                                                    <SelectItem value="fr">Français</SelectItem>
                                                    <SelectItem value="de">Deutsch</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time Zone</Label>
                                            <Select defaultValue="utc">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="utc">UTC</SelectItem>
                                                    <SelectItem value="est">EST</SelectItem>
                                                    <SelectItem value="pst">PST</SelectItem>
                                                    <SelectItem value="cet">CET</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        <CardTitle>Notification Preferences</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Choose what notifications you want to receive
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Email Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications via email
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.email}
                                                onCheckedChange={(checked) =>
                                                    setNotifications(prev => ({ ...prev, email: checked }))
                                                }
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Push Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive push notifications in your browser
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.push}
                                                onCheckedChange={(checked) =>
                                                    setNotifications(prev => ({ ...prev, push: checked }))
                                                }
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Marketing Communications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive updates about new features and promotions
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.marketing}
                                                onCheckedChange={(checked) =>
                                                    setNotifications(prev => ({ ...prev, marketing: checked }))
                                                }
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Security Alerts</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Important security and account notifications
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notifications.security}
                                                onCheckedChange={(checked) =>
                                                    setNotifications(prev => ({ ...prev, security: checked }))
                                                }
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        <CardTitle>Privacy Settings</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Control your privacy and data sharing preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Public Profile</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make your profile visible to other users
                                                </p>
                                            </div>
                                            <Switch
                                                checked={privacy.profilePublic}
                                                onCheckedChange={(checked) =>
                                                    setPrivacy(prev => ({ ...prev, profilePublic: checked }))
                                                }
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Show Email Address</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Display your email on your public profile
                                                </p>
                                            </div>
                                            <Switch
                                                checked={privacy.showEmail}
                                                onCheckedChange={(checked) =>
                                                    setPrivacy(prev => ({ ...prev, showEmail: checked }))
                                                }
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base">Search Engine Indexing</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow search engines to index your public profile
                                                </p>
                                            </div>
                                            <Switch
                                                checked={privacy.allowIndexing}
                                                onCheckedChange={(checked) =>
                                                    setPrivacy(prev => ({ ...prev, allowIndexing: checked }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-6">
                            {/* Data Export */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        <CardTitle>Data Management</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Export or delete your account data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">Export Data</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Download a copy of all your data
                                                </p>
                                            </div>
                                            <Button onClick={handleExportData} disabled={isLoading}>
                                                {isLoading ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4 mr-2" />
                                                )}
                                                Export Data
                                            </Button>
                                        </div>

                                        <Separator />

                                        <div className="border border-destructive/20 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-destructive">Delete Account</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Permanently delete your account and all data
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDeleteAccount}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Account
                                                </Button>
                                            </div>
                                            <Alert variant="destructive" className="mt-4">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    This action cannot be undone. All your data will be permanently deleted.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                    </TabsContent>
                </Tabs>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                    <Button onClick={handleSaveSettings} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Save Settings
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
