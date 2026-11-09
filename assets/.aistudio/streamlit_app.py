import re
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(layout="wide")

ROOT = Path(__file__).parent
html = (ROOT / "index.html").read_text(encoding="utf-8")

def inline_css(m):
    p = ROOT / m.group(1)
    return f"<style>{p.read_text(encoding='utf-8')}</style>" if p.exists() else m.group(0)

def inline_js(m):
    p = ROOT / m.group(1)
    return f"<script>{p.read_text(encoding='utf-8')}</script>" if p.exists() else m.group(0)

html = re.sub(r'<link[^>]*href="([^":]+\.css)"[^>]*>', inline_css, html)
html = re.sub(r'<script[^>]*src="([^":]+\.js)"[^>]*></script>', inline_js, html)

components.html(html, height=900, scrolling=True)
