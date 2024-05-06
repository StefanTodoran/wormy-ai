from collections import defaultdict
from enum import Enum

class LoggingMode(Enum):
    DEBUG = 5
    VERBOSE = 4
    NORMAL = 3
    MINIMAL = 2
    QUIET = 1

    def __str__(self):
        return self.name

    @staticmethod
    def from_string(string):
        try:
            return LoggingMode[string.upper()]
        except KeyError:
            raise ValueError()

class LogPriority(Enum):
    DEBUG = 5
    LOW = 4
    NORMAL = 3
    HIGH = 2
    MAX = 1

coloring = defaultdict(str, {
    "bold": "\033[1m",
    "purple": "\033[35m",
    "blue": "\033[34m",
    "green": "\033[92m",
    "yellow": "\033[93m",
    "red": "\033[91m",
})

mode = LoggingMode.NORMAL
modes = list(LoggingMode)

def set_logging_mode(new_mode):
    global mode
    if mode not in modes:
        raise ValueError("Logging mode must be one of:", modes)
    mode = new_mode
    system_message("Logging mode set to", mode)

def output(*args, priority=LogPriority.NORMAL, color=None, file=None, end="\n"):
    if priority.value > mode.value:
        return

    ansi_code = coloring[color]
    if ansi_code: print(ansi_code + str(args[0]), *args[1:], "\033[0m", file=file, end=end)
    else: print(*args, "\033[0m", file=file, end=end)

def warn(*args, file=None):
    output(*args, priority=LogPriority.HIGH, color="yellow", file=file)

def system_message(*args, file=None, end="\n"):
    output(*args, priority=LogPriority.MAX, file=file, end=end)