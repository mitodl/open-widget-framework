"""
WidgetApp urls
"""
from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^api/v1/lists$', views.get_widget_lists, name='get_lists'),
    url(r'^api/v1/configurations$', views.get_widget_configurations, name='get_configurations'),

    url(r'^api/v1/list/create$', views.create_list, name='create_list'),
    url(r'^api/v1/list/(?P<widget_list_id>\d+)$', views.get_widget_list, name='get_list'),
    url(r'^api/v1/list/(?P<widget_list_id>\d+)/delete$', views.delete_widget_list, name='delete_list'),

    url(r'^api/v1/list/(?P<widget_list_id>\d+)/widget/create$', views.create_widget, name='create_widget'),
    url(r'^api/v1/list/(?P<widget_list_id>\d+)/widget/(?P<widget_id>\d+)$', views.get_widget, name='get_widget'),
    url(r'^api/v1/list/(?P<widget_list_id>\d+)/widget/(?P<widget_id>\d+)/delete$',
        views.delete_widget, name='delete_widget'),
    url(r'^api/v1/list/(?P<widget_list_id>\d+)/widget/(?P<widget_id>\d+)/update$',
        views.update_widget, name='update_widget'),
    url(r'^api/v1/list/(?P<widget_list_id>\d+)/widget/(?P<widget_id>\d+)/move$', views.move_widget, name='move_widget'),

    url(r'^.*$', views.home, name='index'),
]
