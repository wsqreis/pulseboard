from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.modules.audit import models as audit_models  # noqa: E402,F401
from app.modules.auth import models as auth_models  # noqa: E402,F401
from app.modules.comments import models as comment_models  # noqa: E402,F401
from app.modules.communities import models as community_models  # noqa: E402,F401
from app.modules.posts import models as post_models  # noqa: E402,F401
from app.modules.users import models as user_models  # noqa: E402,F401
