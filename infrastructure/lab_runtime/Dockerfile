# ═══════════════════════════════════════════════════════════════
# Lab Runtime Container — Password Cracking Environment
#
# Base: Kali Linux (has john + hashcat in official repos)
# User: labuser (non-root, restricted working directory)
#
# Wordlists available inside container:
#   /usr/share/wordlists/rockyou.txt  — Kali built-in, used by john/hashcat ATTACKS
#   /wordlists/intermediate.txt       — copied from backend/intermediate.txt
#                                       used as password GENERATION source
#
# hash.txt flow:
#   generator.py      → picks word from intermediate.txt, hashes it
#   docker_service.py → writes hash via docker exec to /home/labuser/hash.txt
#   labuser runs:       john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
#                       hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
# ═══════════════════════════════════════════════════════════════

FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive

# ✅ Install cracking tools + shell basics ONLY
#    curl, wget, python3, nano intentionally excluded —
#    not needed for the lab and blocked by command_policy.py
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    coreutils \
    file \
    john \
    hashcat \
    wordlists \
    pocl-opencl-icd \
    ocl-icd-opencl-dev \
    && rm -rf /var/lib/apt/lists/*

# ✅ Unzip rockyou.txt — main attack wordlist used by john and hashcat
#    john  : john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
#    hashcat: hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt
RUN gunzip /usr/share/wordlists/rockyou.txt.gz || true

# ✅ Copy intermediate.txt — password GENERATION source (not attack wordlist)
#    generator.py picks a word from this list, hashes it, and stores it in hash.txt
#    Placed at /wordlists/ to match WORDLIST_DIR env var in the backend
RUN mkdir -p /wordlists
COPY intermediate.txt /wordlists/intermediate.txt
RUN chmod 444 /wordlists/intermediate.txt

# ✅ Copy policy.json (enforcement handled by backend command_policy.py)
COPY policy.json /etc/lab/policy.json

# ✅ Entrypoint sets up locked-down shell environment
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ✅ Non-root labuser
RUN useradd -m -s /bin/bash labuser

# ✅ WORKDIR = labuser home
#    hash.txt is written here at runtime by docker_service.py:
#      container.exec_run("bash -c 'echo <hash> > /home/labuser/hash.txt'")
#    labuser owning their own home dir is correct — this is intentional
WORKDIR /home/labuser

USER labuser

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/bin/bash"]
