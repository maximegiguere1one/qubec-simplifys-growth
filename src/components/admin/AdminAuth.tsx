import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

interface AdminAuthProps {
  onAuthSuccess: (user: User) => void;
}

const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPassword, setShowPassword] = useState({ login: false, signup: false, confirmPassword: false });
  const [formData, setFormData] = useState({
    login: { email: '', password: '' },
    signup: { email: '', password: '', confirmPassword: '', firstName: '', lastName: '' }
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile creation to prevent deadlocks
          setTimeout(async () => {
            try {
              await ensureProfileExists(session.user);
              onAuthSuccess(session.user);
            } catch (error) {
              console.error('Error ensuring profile:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        onAuthSuccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const ensureProfileExists = async (user: User) => {
    try {
      // Use admin-profiles edge function to handle profile creation/update
      const { data, error } = await supabase.functions.invoke('admin-profiles', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) {
        console.error('Error calling admin-profiles function:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create/update profile');
      }

      console.log('Profile ensured:', data.profile);
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Clean up existing state
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.login.email,
        password: formData.login.password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans l\'administration !',
        });
        // The onAuthStateChange will handle the redirect
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Vérifiez vos identifiants.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.signup.password !== formData.signup.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.signup.password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Clean up existing state
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: formData.signup.email,
        password: formData.signup.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.signup.firstName,
            last_name: formData.signup.lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Inscription réussie',
          description: 'Vérifiez votre email pour confirmer votre compte.',
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'Un compte existe déjà avec cette adresse email.';
      }
      
      toast({
        title: 'Erreur d\'inscription',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'login' | 'signup' | 'confirmPassword') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Accès sécurisé à la gestion des leads</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={formData.login.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    login: { ...prev.login, email: e.target.value }
                  }))}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword.login ? 'text' : 'password'}
                    value={formData.login.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      login: { ...prev.login, password: e.target.value }
                    }))}
                    required
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('login')}
                  >
                    {showPassword.login ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstName">Prénom</Label>
                  <Input
                    id="signup-firstName"
                    type="text"
                    value={formData.signup.firstName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      signup: { ...prev.signup, firstName: e.target.value }
                    }))}
                    required
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastName">Nom</Label>
                  <Input
                    id="signup-lastName"
                    type="text"
                    value={formData.signup.lastName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      signup: { ...prev.signup, lastName: e.target.value }
                    }))}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={formData.signup.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    signup: { ...prev.signup, email: e.target.value }
                  }))}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword.signup ? 'text' : 'password'}
                    value={formData.signup.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      signup: { ...prev.signup, password: e.target.value }
                    }))}
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('signup')}
                  >
                    {showPassword.signup ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="signup-confirmPassword"
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    value={formData.signup.confirmPassword}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      signup: { ...prev.signup, confirmPassword: e.target.value }
                    }))}
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Inscription...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    S'inscrire
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Alert className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Accès administrateur requis pour la gestion des leads et des analytics.
          </AlertDescription>
        </Alert>
      </Card>
    </div>
  );
};