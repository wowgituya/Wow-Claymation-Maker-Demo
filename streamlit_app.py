import streamlit as st
from google import genai
import os

# --- Konfigurasi Halaman ---
# Menetapkan judul halaman dan tampilan yang bersih
st.set_page_config(page_title="Aplikasi AI Saya", layout="centered")

# Menggunakan Streamlit secrets untuk mendapatkan Kunci API
# Kunci ini harus Anda masukkan di Streamlit Cloud sebagai 'GEMINI_API_KEY'
api_key = st.secrets.get("GEMINI_API_KEY")

if not api_key:
    st.error("Kunci API Gemini tidak ditemukan. Harap tambahkan 'GEMINI_API_KEY' ke Streamlit Secrets.")
else:
    # --- Inisialisasi Model ---
    try:
        # Gunakan client dan model yang sesuai dengan aplikasi Anda
        client = genai.Client(api_key=api_key)
        model_name = "gemini-2.5-flash"  # Ganti jika Anda menggunakan model yang berbeda
    except Exception as e:
        st.error(f"Gagal menginisialisasi klien Gemini: {e}")
        st.stop()
        
    # --- Antarmuka Pengguna (UI) ---
    st.title("✨ Pembuat Teks Ajaib")
    st.markdown("Masukkan ide Anda dan biarkan AI menciptakannya!")

    # Kotak input untuk prompt pengguna
    user_prompt = st.text_area("Masukkan Prompt Anda di sini:", height=150)
    
    # Tombol untuk memicu pemanggilan API
    if st.button("Hasilkan Teks"):
        if user_prompt:
            with st.spinner("AI sedang bekerja..."):
                try:
                    # --- Pemanggilan API Gemini ---
                    response = client.models.generate_content(
                        model=model_name,
                        contents=user_prompt
                    )
                    
                    # --- Menampilkan Hasil ---
                    st.success("Hasil:")
                    st.write(response.text)
                    
                except Exception as e:
                    st.error(f"Terjadi kesalahan saat memanggil API: {e}")
        else:
            st.warning("Mohon masukkan prompt terlebih dahulu.")