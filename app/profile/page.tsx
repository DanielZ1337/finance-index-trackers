'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Mail,
    Calendar,
    Shield,
    Save,
    AlertCircle,
    CheckCircle,
    Loader2,
    Github,
    Smartphone,
    Monitor,
    Tablet,
    Globe,
    LogOut
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AuthenticatedLayout } from '@/components/authenticated-layout';
import { useSessions } from '@/hooks/use-sessions';
import SessionAnalytics from '@/components/dashboard/session-analytics';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
    const { data: session, isPending } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [email, setEmail] = useState(session?.user?.email || '');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    // Session management
    const {
        sessions,
        loading: sessionsLoading,
        error: sessionsError,
        refetch: refetchSessions,
        revokeSession,
        revokeAllOtherSessions
    } = useSessions();

    if (isPending) {
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
                            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p>Please sign in to view your profile</p>
                            <Button asChild>
                                <a href="/sign-in">Sign In</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </AuthenticatedLayout>
        );
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            // Here you would call your update profile API
            // await updateProfile({ name, email });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage('Profile updated successfully');
            setMessageType('success');
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevokeSession = async (sessionToken: string) => {
        const result = await revokeSession(sessionToken);
        if (result.success) {
            setMessage('Session terminated successfully');
            setMessageType('success');
        } else {
            setMessage(result.error || 'Failed to terminate session');
            setMessageType('error');
        }
    };

    const handleRevokeAllOtherSessions = async () => {
        const result = await revokeAllOtherSessions();
        if (result.success) {
            setMessage('All other sessions have been terminated');
            setMessageType('success');
        } else {
            setMessage(result.error || 'Failed to terminate sessions');
            setMessageType('error');
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-5 w-5" />;
            case 'tablet':
                return <Tablet className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AuthenticatedLayout title="Profile Settings">
            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                {message && (
                    <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                        {messageType === 'error' ? (
                            <AlertCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="sessions">Sessions</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        {/* Profile Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                                        {getInitials(session.user.name || 'U')}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold">{session.user.name}</h2>
                                        <p className="text-muted-foreground">{session.user.email}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant={session.user.emailVerified ? "default" : "secondary"}>
                                                {session.user.emailVerified ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Unverified
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Edit Profile Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your personal details here
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {message && (
                                    <Alert variant={messageType === 'error' ? 'destructive' : 'default'} className="mb-6">
                                        {messageType === 'error' ? (
                                            <AlertCircle className="h-4 w-4" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        <AlertDescription>{message}</AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium">User ID</p>
                                            <p className="text-sm text-muted-foreground">{session.user.id}</p>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4" />
                                        <div>
                                            <p className="font-medium">Email Status</p>
                                            <p className="text-sm text-muted-foreground">
                                                {session.user.emailVerified ? 'Verified' : 'Pending verification'}
                                            </p>
                                        </div>
                                    </div>
                                    {!session.user.emailVerified && (
                                        <Button variant="outline" size="sm">
                                            Resend Verification
                                        </Button>
                                    )}
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Member Since</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(session.user.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage your account security and authentication methods
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Password</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Change your account password
                                            </p>
                                        </div>
                                        <Button variant="outline">Change Password</Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Two-Factor Authentication</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Add an extra layer of security to your account
                                            </p>
                                        </div>
                                        <Button variant="outline">Enable 2FA</Button>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Connected Accounts</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage your connected social accounts
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Github className="h-5 w-5" />
                                                <div>
                                                    <p className="font-medium">GitHub</p>
                                                    <p className="text-sm text-muted-foreground">Connected</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Disconnect
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sessions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Active Sessions</CardTitle>
                                        <CardDescription>
                                            Manage and monitor your active sessions across devices
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={refetchSessions}
                                        disabled={sessionsLoading}
                                    >
                                        {sessionsLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Refresh'
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {sessionsError && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{sessionsError}</AlertDescription>
                                    </Alert>
                                )}

                                {sessionsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No active sessions found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sessions.map((deviceSession) => (
                                            <div
                                                key={deviceSession.id}
                                                className={`flex items-center justify-between p-4 border rounded-lg ${deviceSession.isCurrent ? 'border-primary bg-primary/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getDeviceIcon(deviceSession.device?.type || 'desktop')}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">
                                                                {deviceSession.device?.browser || 'Unknown Browser'} on {deviceSession.device?.os || 'Unknown OS'}
                                                            </p>
                                                            {deviceSession.isCurrent && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Current
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            <span>
                                                                Last active: {formatDistanceToNow(deviceSession.updatedAt, { addSuffix: true })}
                                                            </span>
                                                            {deviceSession.ipAddress && (
                                                                <span className="flex items-center gap-1">
                                                                    <Globe className="h-3 w-3" />
                                                                    IP: {deviceSession.ipAddress.slice(0, 8)}...
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!deviceSession.isCurrent && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRevokeSession(deviceSession.token)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <LogOut className="h-4 w-4 mr-1" />
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="text-sm text-muted-foreground">
                                                {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                                                {sessions.filter(s => !s.isCurrent).length > 0 && (
                                                    <span> • {sessions.filter(s => !s.isCurrent).length} other device{sessions.filter(s => !s.isCurrent).length !== 1 ? 's' : ''}</span>
                                                )}
                                            </div>
                                            {sessions.filter(s => !s.isCurrent).length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRevokeAllOtherSessions}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <LogOut className="h-4 w-4 mr-1" />
                                                    Sign out all other devices
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Personal Analytics
                                </CardTitle>
                                <CardDescription>
                                    View your personal indicator usage and session analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SessionAnalytics />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
