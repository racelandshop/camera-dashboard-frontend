from setuptools import setup, find_packages

setup(
    name="cameras-dashboard",
    version="20221009112053",
    description="The Cameras Dashboard frontend",
    url="https://github.com/racelandshop/camera-dashboard-frontend",
    author="Rogério Ribeiro",
    author_email="zroger499@gmail.com",
    packages=find_packages(include=["cameras_dashboard"]),
    include_package_data=True,
    zip_safe=False,
)