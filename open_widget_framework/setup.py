"""
The MIT License (MIT)
Copyright (c) 2018 Zagaran, Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@author: Jake Klingensmith
"""

import sys

from setuptools import setup, find_packages

if sys.version < "3":
    print("ERROR: python version 3 or higher is required")
    sys.exit(1)

setup(
    name="open_widget_framework",
    version="0.2.7",
    packages=find_packages(),
    install_requires=["Django>=2.1.2", "djangorestframework>=3", "psycopg2>=2.7"],
    license="MIT",
    author="Zagaran, Inc.",
    url="https://github.com/mitodl/open-widget-framework",
    description="an open django framework for widget customization and management",
)
