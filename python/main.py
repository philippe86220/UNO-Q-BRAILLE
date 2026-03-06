import time
from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI
from braille import char_to_mask, normalize_char

ui = WebUI()
bridge = Bridge()

_state = {
    "char": "",
    "mask": 0
}


def show(letter=None):
    c = normalize_char(letter)

    if c is None:
        return {
            "ok": False,
            "error": "caractere_non_supporte"
        }

    mask = char_to_mask(c)

    try:
        if c.isdigit():
            bridge.call("setBrailleMask", char_to_mask("#"), timeout=10)
            time.sleep(0.6)
            
        elif c.isalpha():
            bridge.call("setBrailleMask", char_to_mask("^"), timeout=10)
            time.sleep(0.6)

        ack = bridge.call("setBrailleMask", mask, timeout=10)
         
        
    except Exception as e:
        return {
            "ok": False,
            "error": repr(e)
        }

    _state["char"] = c
    _state["mask"] = mask

    return {
        "ok": True,
        "char": c,
        "mask": mask,
        "ack": ack
    }

def off():
    try:
        ack = bridge.call("allOffBraille", 0, timeout=10)
    except Exception as e:
        return {
            "ok": False,
            "error": repr(e)
        }

    _state["char"] = ""
    _state["mask"] = 0

    return {
        "ok": True,
        "char": "",
        "mask": 0,
        "ack": ack
    }

def on():
    try:
        ack = bridge.call("allOnBraille", 0, timeout=10)
    except Exception as e:
        return {
            "ok": False,
            "error": repr(e)
        }

    _state["char"] = "*"
    _state["mask"] = 63

    return {
        "ok": True,
        "char": "*",
        "mask": 63,
        "ack": ack
    }

def state():
    return {
        "ok": True,
        "char": _state["char"],
        "mask": _state["mask"]
    }

ui.expose_api("GET", "/show", show)
ui.expose_api("GET", "/off", off)
ui.expose_api("GET", "/on", on)
ui.expose_api("GET", "/state", state)

print("WebUI ready: /show?letter=A  /off  /on  /state", flush=True)

App.run()
