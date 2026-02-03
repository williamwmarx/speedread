'use client'

import { useTheme } from 'next-themes'
import type { ReaderSettings } from '@speedread/shared'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/cn'

interface SettingsPanelProps {
  settings: ReaderSettings
  onSettingsChange: (update: Partial<ReaderSettings>) => void
  onClose: () => void
  open: boolean
}

const fontSizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
] as const

const chunkSizeOptions = [
  { value: '1', label: '1 word' },
  { value: '2', label: '2 words' },
  { value: '3', label: '3 words' },
] as const

export function SettingsPanel({
  settings,
  onSettingsChange,
  onClose,
  open,
}: SettingsPanelProps): React.ReactElement {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-xl transition-transform duration-300 ease-out-expo',
        open ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings</h2>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reading Speed */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Reading Speed: <span className="tabular-nums">{settings.wpm}</span> WPM
          </label>
          <Slider
            value={[settings.wpm]}
            onValueChange={([wpm]) => onSettingsChange({ wpm })}
            min={100}
            max={1000}
            step={25}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Use ↑/↓ arrows while reading</p>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Font Size</label>
          <Select value={settings.fontSize} onValueChange={(v) => onSettingsChange({ fontSize: v as ReaderSettings['fontSize'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chunk Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Words per Display</label>
          <Select value={String(settings.chunkSize)} onValueChange={(v) => onSettingsChange({ chunkSize: Number(v) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chunkSizeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Theme</label>
          <Select value={theme || 'system'} onValueChange={(v) => setTheme(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Adaptive Timing */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Adaptive Timing</label>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Slow down for longer words</p>
          </div>
          <Switch checked={settings.adaptiveTiming} onCheckedChange={(v) => onSettingsChange({ adaptiveTiming: v })} />
        </div>

        {/* Sentence Pause */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Sentence Pause: <span className="tabular-nums">{settings.sentencePauseMultiplier}x</span>
          </label>
          <Slider
            value={[settings.sentencePauseMultiplier]}
            onValueChange={([v]) => onSettingsChange({ sentencePauseMultiplier: v })}
            min={1}
            max={5}
            step={0.5}
          />
        </div>

        {/* Paragraph Pause */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Paragraph Pause: <span className="tabular-nums">{settings.paragraphPauseMultiplier}x</span>
          </label>
          <Slider
            value={[settings.paragraphPauseMultiplier]}
            onValueChange={([v]) => onSettingsChange({ paragraphPauseMultiplier: v })}
            min={1}
            max={6}
            step={0.5}
          />
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-6 border-t border-[hsl(var(--border))] pt-6">
        <h3 className="mb-3 text-sm font-medium">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Kbd>Space</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Play/Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>←</Kbd>/<Kbd>→</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Skip words</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>↑</Kbd>/<Kbd>↓</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Change WPM</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>r</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Restart</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>s</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>d</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Dark mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>f</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Fullscreen</span>
          </div>
          <div className="flex items-center gap-2">
            <Kbd>Esc</Kbd>
            <span className="text-[hsl(var(--muted-foreground))]">Exit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
