import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { Search, BookOpen, X, ArrowRight, Sparkles, GraduationCap, ChevronDown, Check, LayoutGrid, Tag } from 'lucide-react';

export const CourseCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Auto-suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Category custom dropdown state
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef(null);

  // Pricing type custom dropdown state
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Live debounced search & filter
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCourses();
      // Synchronize URL search params
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCat) params.category = selectedCat;
      setSearchParams(params, { replace: true });
    }, 280);

    return () => clearTimeout(handler);
  }, [search, selectedCat, typeFilter]);

  // Close suggestions and dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setIsCatDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setIsCatDropdownOpen(false);
        setIsTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/courses/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let query = `/courses?`;
      if (search.trim()) query += `search=${encodeURIComponent(search.trim())}&`;
      if (selectedCat) query += `category=${selectedCat}&`;
      if (typeFilter) query += `type=${typeFilter}&`;

      const res = await API.get(query);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchCourses();
  };

  const handleClearSearch = () => {
    setSearch('');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (courseId) => {
    setShowSuggestions(false);
    navigate(`/courses/${courseId}`);
  };

  // Filter top matches for suggestion dropdown
  const suggestions = search.trim().length > 0 ? courses.slice(0, 5) : [];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Explore Course Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Discover high-impact courses, interactive lessons, and timed quiz certifications</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', position: 'relative', zIndex: 40 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Input Container with Suggestions */}
          <div ref={searchContainerRef} style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', zIndex: 2 }} />
            
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search course title, MERN, Python, etc..."
              style={{ paddingLeft: '40px', paddingRight: search ? '38px' : '14px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (search.trim().length > 0) setShowSuggestions(true);
              }}
            />

            {/* Clear Button */}
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '50%'
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}

            {/* Auto-Suggestion Dropdown */}
            {showSuggestions && search.trim().length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#111827',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(16px)',
                  overflow: 'hidden',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(99, 102, 241, 0.08)'
                }}>
                  <Sparkles size={14} /> Matching Course Suggestions
                </div>

                {suggestions.length === 0 ? (
                  <div style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {loading ? 'Searching courses...' : `No courses matching "${search}"`}
                  </div>
                ) : (
                  <div style={{ maxHeight: '310px', overflowY: 'auto' }}>
                    {suggestions.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectSuggestion(item._id)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.14)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Course Thumbnail */}
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#1f293d',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          {item.thumbnail ? (
                            <img 
                              src={item.thumbnail} 
                              alt={item.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <GraduationCap size={20} color="var(--primary)" />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 600,
                            fontSize: '0.92rem',
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.name}
                          </div>
                          <div style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '2px'
                          }}>
                            <span>{item.category?.name || 'General'}</span>
                            <span>•</span>
                            <span>By {item.tutor?.name || 'Instructor'}</span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: item.type === 'free' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: item.type === 'free' ? 'var(--success)' : 'var(--primary)'
                          }}>
                            {item.type === 'free' ? 'FREE' : `$${item.price}`}
                          </span>
                          <ArrowRight size={15} color="var(--text-dim)" />
                        </div>
                      </div>
                    ))}

                    {/* View all search matches */}
                    <div
                      onClick={() => setShowSuggestions(false)}
                      style={{
                        padding: '9px 14px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                    >
                      View all {courses.length} matching courses in catalog →
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modern LMS Category Dropdown */}
          <div ref={catDropdownRef} style={{ position: 'relative', minWidth: '190px' }}>
            <button
              type="button"
              className={`category-dropdown-trigger ${isCatDropdownOpen ? 'open' : ''}`}
              style={{ width: '100%' }}
              onClick={() => {
                setIsCatDropdownOpen(!isCatDropdownOpen);
                setIsTypeDropdownOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={isCatDropdownOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <LayoutGrid size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedCat 
                    ? (categories.find(c => c._id === selectedCat)?.name || 'Category')
                    : 'All Categories'}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                style={{ 
                  flexShrink: 0, 
                  color: 'var(--text-muted)',
                  transform: isCatDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isCatDropdownOpen && (
              <div 
                className="category-dropdown-menu" 
                role="listbox" 
                aria-label="Course Categories"
              >
                <div style={{
                  padding: '6px 10px 4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-dim)'
                }}>
                  Select Category
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {/* All Categories Option */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={!selectedCat}
                    className={`category-dropdown-item ${!selectedCat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCat('');
                      setIsCatDropdownOpen(false);
                    }}
                  >
                    <span>All Categories</span>
                    {!selectedCat && <Check size={14} color="var(--primary)" />}
                  </button>

                  {/* Dynamic Categories */}
                  {categories.map((c) => {
                    const isSelected = selectedCat === c._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`category-dropdown-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCat(c._id);
                          setIsCatDropdownOpen(false);
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                        {isSelected && <Check size={14} color="var(--primary)" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modern LMS Pricing Type Dropdown */}
          <div ref={typeDropdownRef} style={{ position: 'relative', minWidth: '160px' }}>
            <button
              type="button"
              className={`category-dropdown-trigger ${isTypeDropdownOpen ? 'open' : ''}`}
              style={{ width: '100%' }}
              onClick={() => {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
                setIsCatDropdownOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={isTypeDropdownOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Tag size={15} color="var(--secondary)" style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {typeFilter === 'free' 
                    ? 'Free Courses' 
                    : typeFilter === 'paid' 
                      ? 'Paid Courses' 
                      : 'All Pricing'}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                style={{ 
                  flexShrink: 0, 
                  color: 'var(--text-muted)',
                  transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isTypeDropdownOpen && (
              <div 
                className="category-dropdown-menu" 
                role="listbox" 
                aria-label="Course Pricing"
                style={{ minWidth: '180px' }}
              >
                <div style={{
                  padding: '6px 10px 4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-dim)'
                }}>
                  Select Pricing
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* All Pricing */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={!typeFilter}
                    className={`category-dropdown-item ${!typeFilter ? 'active' : ''}`}
                    onClick={() => {
                      setTypeFilter('');
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    <span>All Pricing</span>
                    {!typeFilter && <Check size={14} color="var(--primary)" />}
                  </button>

                  {/* Free Courses */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={typeFilter === 'free'}
                    className={`category-dropdown-item ${typeFilter === 'free' ? 'active' : ''}`}
                    onClick={() => {
                      setTypeFilter('free');
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    <span>Free Courses</span>
                    {typeFilter === 'free' && <Check size={14} color="var(--primary)" />}
                  </button>

                  {/* Paid Courses */}
                  <button
                    type="button"
                    role="option"
                    aria-selected={typeFilter === 'paid'}
                    className={`category-dropdown-item ${typeFilter === 'paid' ? 'active' : ''}`}
                    onClick={() => {
                      setTypeFilter('paid');
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    <span>Paid Courses</span>
                    {typeFilter === 'paid' && <Check size={14} color="var(--primary)" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Courses Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria or filters</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.5rem'
        }}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};
