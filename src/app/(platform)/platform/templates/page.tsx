import { db } from '@/lib/db';
import { storefrontTemplates } from '@/lib/db/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

/**
 * Template Registry Page — Lists all storefront templates from DB.
 */
export default async function TemplatesPage() {
  const templates = await db
    .select()
    .from(storefrontTemplates)
    .orderBy(storefrontTemplates.name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Template Registry
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage storefront templates ({templates.length} available)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const meta = template.metadata as any;
          return (
            <Card key={template.id} className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Layers className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">
                        {template.slug}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={template.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description || 'No description provided.'}
                </p>
                {meta?.features && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(meta.features as string[]).map((feat: string) => (
                      <Badge key={feat} variant="outline" className="text-xs">
                        {feat}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
