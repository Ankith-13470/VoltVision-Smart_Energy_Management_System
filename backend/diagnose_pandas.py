import sys, os, subprocess, textwrap
print('python executable:', sys.executable)
print('python version:', sys.version)

# pip show pandas
print('\n-- pip show pandas --')
try:
    import pkgutil
    import importlib.util
    spec = importlib.util.find_spec('pandas')
    print('pandas spec:', spec)
except Exception as e:
    print('find_spec failed:', e)

try:
    import pkg_resources
except Exception:
    pass

try:
    from importlib.metadata import distribution
    dist = distribution('pandas')
    print('distribution metadata:', dist.metadata['Name'], dist.version)
except Exception as e:
    print('importlib.metadata failed:', e)

# List site-packages
from pathlib import Path
site_packages = [p for p in sys.path if 'site-packages' in p]
print('\nsite-packages paths:')
for p in site_packages:
    print(' -', p)

# Look for pandas._libs files
for p in site_packages:
    pth = Path(p) / 'pandas' / '_libs'
    if pth.exists():
        print('\nFound pandas._libs at', pth)
        for f in sorted(pth.iterdir()):
            try:
                size = f.stat().st_size
            except Exception as e:
                size = 'err'
            print(' ', f.name, size)
    
# Attempt import to show error
print('\nAttempting to import pandas to reproduce error:')
try:
    import pandas as pd
    print('pandas imported, version', pd.__version__)
except Exception as e:
    print('IMPORT ERROR:', repr(e))

# Show pip list
print('\n-- pip list --')
try:
    out = subprocess.check_output([sys.executable, '-m', 'pip', 'list'], text=True)
    print(out)
except Exception as e:
    print('pip list failed:', e)
