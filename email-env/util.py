from collections import defaultdict
from enum import Enum

class LoggingMode(Enum):
    DEBUG = 4
    VERBOSE = 3
    NORMAL = 2
    QUIET = 1

    def __str__(self):
        return self.name

    @staticmethod
    def from_string(string):
        try:
            return LoggingMode[string.upper()]
        except KeyError:
            raise ValueError()

class LogType(Enum):
    DEBUG = 0
    VERBOSE = 1
    NORMAL = 2
    SUCCESS = 3
    WARN = 4
    FAIL = 5
    SYSTEM = 6

priority = {
    LogType.DEBUG: 4, # Only in debug mode
    LogType.VERBOSE: 3, # Verbose mode or above
    LogType.NORMAL: 2, # Normal or above
    LogType.SUCCESS: 2,
    LogType.WARN: 2,
    LogType.FAIL: 1, # Always logged
    LogType.SYSTEM: 1,
}

coloring = defaultdict(str, {
    LogType.DEBUG: "\033[1m\033[33m",
    LogType.SYSTEM: "\033[34m",
    LogType.SUCCESS: "\033[92m",
    LogType.WARN: "\033[93m",
    LogType.FAIL: "\033[91m",
})

mode = LoggingMode.NORMAL
modes = list(LoggingMode)

def set_logging_mode(new_mode):
    global mode
    if mode not in modes:
        raise ValueError("Logging mode must be one of:", modes)
    mode = new_mode
    log("Logging mode set to", mode, status=LogType.SYSTEM)

def log(*args, status=LogType.NORMAL, file=None, end="\n"):
    if priority[status] > mode.value:
        return

    ansi_code = coloring[status]
    print(ansi_code, *args, "\033[0m", file=file, end=end)