#!/usr/bin/env python3
import os, uuid, stat, time

if os.name == 'nt':
    print("This script doesn't support windows environment!")
    exit(1)

if os.geteuid() != 0:
    print("This script must be run by root user!")
    exit(1)

PROFILE_SCRIPT = "/etc/uniqidenty"
try:
    st = os.stat(PROFILE_SCRIPT)
    if not stat.S_ISREG(st.st_mode):
        print(f"{PROFILE_SCRIPT} is a directory!")
        exit(1)
    os.access(PROFILE_SCRIPT, os.R_OK)
except FileNotFoundError:
    pass
except PermissionError:
    print(f"{PROFILE_SCRIPT} is not readable by current user!")
    exit(1)
else:
    with open(PROFILE_SCRIPT, 'r') as f:
        mid = f.readline().split(',')[0]
        print(f"Uniqidentity: {mid}")
    exit(0)

uuid_val = uuid.uuid4()
now = int(time.time())
with open(PROFILE_SCRIPT, 'w') as f:
    os.chmod(PROFILE_SCRIPT, stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)
    f.write(f"{uuid_val},{now}\n")
