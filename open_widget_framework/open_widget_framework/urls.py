"""
WidgetApp urls
"""
from django.conf.urls import url
from django.urls import include
from rest_framework import routers

from open_widget_framework.views import (
    WidgetViewSet,
    WidgetListViewSet,
)

router = routers.SimpleRouter()
router.register(r'list', WidgetListViewSet, basename="widget-list")
router.register(r'widget', WidgetViewSet, basename="widget")

urlpatterns = [
    url(r"^api/v1/", include(router.urls))
]
