class DecodedMsg():
    def __init__(self, msg_type, msg):
        self.msg_type = msg_type
        self.msg = msg

    def to_dict(self):
        return {
            "msg_type": self.msg_type,
            "msg": self.msg
        }

    