from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


class ContactIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=200)]
    phone: Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=50)]
    subject: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=200)]
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=3000)]
