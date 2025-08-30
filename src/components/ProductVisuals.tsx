import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";

export const ProductVisuals = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">À quoi ressemble One Système en action ?</h2>
          <p className="text-xl text-muted-foreground">
            Découvrez l'interface simple que nos clients utilisent chaque jour
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Facturation Automatique */}
          <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
            <Badge className="mb-4 bg-success/20 text-success">Facturation TPS/TVQ</Badge>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center border">
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm border max-w-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Facture #2024-001</span>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <hr className="mb-2" />
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>1 000,00$</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>TPS (5%):</span>
                      <span>50,00$</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>TVQ (9.975%):</span>
                      <span>99,75$</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>1 149,75$</span>
                    </div>
                  </div>
                </div>
                <Zap className="w-6 h-6 text-primary mx-auto mt-2 animate-pulse" />
                <p className="text-xs text-muted-foreground mt-1">Taxes calculées automatiquement</p>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Facturation conforme en 1 clic</h3>
            <p className="text-sm text-muted-foreground">
              Plus jamais d'erreurs de calcul TPS/TVQ. Factures conformes aux normes québécoises.
            </p>
          </Card>

          {/* Dashboard Unifié */}
          <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
            <Badge className="mb-4 bg-primary/20 text-primary">Tableau de Bord</Badge>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center border">
              <div className="w-full">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white rounded p-2 text-center shadow-sm">
                    <p className="text-xs text-muted-foreground">Ventes aujourd'hui</p>
                    <p className="text-sm font-bold text-success">2 847$</p>
                  </div>
                  <div className="bg-white rounded p-2 text-center shadow-sm">
                    <p className="text-xs text-muted-foreground">Commandes</p>
                    <p className="text-sm font-bold">23</p>
                  </div>
                </div>
                <div className="bg-white rounded p-2 mb-2 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Stock faible</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>T-shirt Bleu (M)</span>
                    <span className="text-warning font-medium">3 restants</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">À faire</p>
                  <div className="text-xs">
                    <span>• Relance Client ABC Inc.</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Vue d'ensemble en temps réel</h3>
            <p className="text-sm text-muted-foreground">
              Toutes vos données importantes sur un seul écran. Ventes, stock, tâches.
            </p>
          </Card>

          {/* Synchronisation */}
          <Card className="p-6 shadow-card hover:shadow-medium transition-all duration-300">
            <Badge className="mb-4 bg-warning/20 text-warning">Synchronisation</Badge>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center border">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-white rounded p-2 shadow-sm border">
                    <span className="text-xs">💰 Ventes</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <div className="bg-white rounded p-2 shadow-sm border">
                    <span className="text-xs">📦 Stock</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary rotate-90" />
                </div>
                <div className="bg-white rounded p-2 shadow-sm border">
                  <span className="text-xs">📊 Comptabilité</span>
                </div>
                <div className="text-xs text-success font-medium">
                  ✅ Tout synchronisé automatiquement
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Fini les doubles saisies</h3>
            <p className="text-sm text-muted-foreground">
              Une vente met à jour automatiquement le stock, la comptabilité et les relances.
            </p>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg font-medium">
              🎯 <strong>Ces captures d'écran représentent une vraie journée</strong> avec One Système
            </p>
            <p className="text-muted-foreground mt-2">
              Simple, efficace, et pensé pour vous faire gagner du temps dès le premier jour
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};