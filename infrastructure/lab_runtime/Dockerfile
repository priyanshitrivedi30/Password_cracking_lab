FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive

# Install tools + wordlists
RUN apt-get update && apt-get install -y \
    bash \
    nano \
    coreutils \
    curl \
    python3 \
    john \
    hashcat \
    wordlists \
    && rm -rf /var/lib/apt/lists/*

# 🔥 Unzip rockyou if compressed
RUN gunzip /usr/share/wordlists/rockyou.txt.gz || true

# Create non-root user
RUN useradd -m -s /bin/bash labuser

# Switch to lab directory
WORKDIR /home/labuser

USER labuser

CMD ["/bin/bash"]