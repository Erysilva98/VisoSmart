from pathlib import Path
def edit(path,fn):
 p=Path(path);p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
def calendar(s):
 s=s.replace("import { ReceiptText }", "import { ChevronDown, ChevronUp, ReceiptText }")
 s=s.replace("import { localDayKey }", "import { calendarDays } from '@/lib/calendarDays';\nimport { localDayKey }")
 s=s.replace('compact = false, onAdd','compact = false, weekOnly = false, expandable = false, expanded = false, onToggle, onAdd')
 s=s.replace('compact?: boolean;', 'compact?: boolean; weekOnly?: boolean; expandable?: boolean; expanded?: boolean; onToggle?: () => void;')
 s=s.replace('aria-label={`Calendário de', 'data-expanded={expanded} data-week-only={weekOnly} aria-label={`Calendário de')
 a=s.index('<button type="button" onClick={onViewStatement}');b=s.index('</header>',a)
 s=s[:a]+'''<div className="flex items-center gap-1">{expandable && <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls="home-calendar-days" aria-label={expanded ? 'Recolher calendário para a semana' : 'Expandir calendário do mês'} className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-50">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>}'''+s[a:b]+ '</div>'+s[b:]
 s=s.replace('<div className={`${compact ?', '<div id="home-calendar-days" aria-label={weekOnly ? \'Semana atual no mês selecionado\' : \'Dias do mês\'} className={`${compact ?')
 a=s.index('      {Array.from({ length: offset }');b=s.index('        const entries =',a)
 s=s[:a]+'''      {calendarDays(month, weekOnly).map((day, index) => {
        if (day === null) return <span key={`empty-${index}`} />;
'''+s[b:]
 s=s.replace('(offset + index) % 7 === 0 || (offset + index) % 7 === 6','index % 7 === 0 || index % 7 === 6')
 return s
edit('src/components/ui/SpendingCalendar.tsx',calendar)
edit('src/components/ui/ExpenseDonut.tsx',lambda s:s.replace('compact = false, onSelect','compact = false, expanded = false, onSelect').replace('compact?: boolean;', 'compact?: boolean; expanded?: boolean;').replace('const visible = compact ?', 'const visible = compact && !expanded ?').replace('compact && paths.length > 3','compact && !expanded && paths.length > 3').replace('<div>{visible.map','<div className="category-legend">{visible.map'))
def dashboard(s):
 s=s.replace('ChartPie, ReceiptText','ChartPie, ChevronDown, ChevronUp, ReceiptText')
 s=s.replace('  const [registrationDate', '''  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia('(max-width: 767px) and (max-height: 780px)').matches);
  const [expandedPanel, setExpandedPanel] = useState<'calendar' | 'categories' | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px) and (max-height: 780px)');
    const update = () => { setSmallScreen(media.matches); setExpandedPanel(null); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!expandedPanel) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpandedPanel(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [expandedPanel]);
  const [registrationDate''')
 s=s.replace("useEffect(() => { recordPractice('month', month);", "useEffect(() => { setExpandedPanel(null); recordPractice('month', month);")
 s=s.replace('    <SpendingCalendar key={month} compact', '''    <div className="home-insights" data-expanded={expandedPanel ?? 'none'}>
    <div className="home-calendar-slot"><SpendingCalendar key={month} compact weekOnly={smallScreen && expandedPanel !== 'calendar'} expandable={smallScreen} expanded={expandedPanel === 'calendar'} onToggle={() => setExpandedPanel((value) => value === 'calendar' ? null : 'calendar')}''')
 s=s.replace('onAdd={(date) => openAdd(date)} />','onAdd={(date) => openAdd(date)} /></div>')
 s=s.replace('{variant !== 4 && <section aria-label="Gastos por categoria"', '{variant !== 4 && <div className="home-categories-slot"><section data-expanded={expandedPanel === \'categories\'} aria-label="Gastos por categoria"')
 s=s.replace('<div className="flex shrink-0 items-center gap-2"><button', '''<div className="flex shrink-0 items-center gap-1">{view.categories.length > 3 && <button type="button" onClick={() => setExpandedPanel((value) => value === 'categories' ? null : 'categories')} aria-expanded={expandedPanel === 'categories'} aria-controls="home-category-chart" aria-label={expandedPanel === 'categories' ? 'Recolher categorias' : 'Expandir todas as categorias'} className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-50">{expandedPanel === 'categories' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</button>}<button''')
 s=s.replace('</header>{view.categories.length ?', '</header><div id="home-category-chart" className="home-category-chart">{view.categories.length ?')
 s=s.replace('<ExpenseDonut compact budgets=', '<ExpenseDonut compact expanded={expandedPanel === \'categories\'} budgets=')
 s=s.replace('</p>}</section>}','</p>}</div></section></div>}\n    </div>')
 return s
edit('src/pages/Dashboard.tsx',dashboard)
