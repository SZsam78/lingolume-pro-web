import re

with open("src/features/editor/ItemEditors.tsx", "r") as f:
    content = f.text if hasattr(f, 'text') else f.read()

# Shared Meta Editor
content = content.replace('bg-slate-50 rounded-xl border border-slate-100', 'bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700')
content = content.replace('text-slate-500 uppercase', 'text-slate-500 dark:text-slate-400 uppercase')
content = content.replace('bg-white focus:ring-2', 'bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2')

# Textareas and inputs missing bg-white
content = re.sub(r'className="(.*?)border focus:ring-2', r'className="\1border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:ring-2', content)
content = re.sub(r'className="(.*?)border rounded-lg focus:ring-primary', r'className="\1border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white rounded-lg focus:ring-primary', content)
content = content.replace('border bg-slate-50 text-sm', 'border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm')

# Fill Blank Warning
content = content.replace('bg-blue-50 text-blue-700', 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300')

# Minitest
content = content.replace('bg-orange-50 border border-orange-100', 'bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-900/50')
content = content.replace('text-orange-800 font-bold', 'text-orange-800 dark:text-orange-400 font-bold')
content = content.replace('text-orange-600', 'text-orange-600 dark:text-orange-400/80')

# Check buttons
content = content.replace('border-slate-200 text-slate-400', 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500')

with open("src/features/editor/ItemEditors.tsx", "w") as f:
    f.write(content)
